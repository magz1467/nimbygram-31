import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { searchCache } from '@/services/cache/search-cache';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { withRetry } from '@/utils/retry';
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [progressiveResults, setProgressiveResults] = useState<Application[]>([]);
  const [isLoadingProgressive, setIsLoadingProgressive] = useState<boolean>(false);
  const { toast } = useToast();
  const errorRef = useRef<Error | null>(null);
  const searchMethodRef = useRef<'spatial' | 'fallback' | null>(null);
  
  const handleSearchError = useCallback((err: any, context: any = {}) => {
    console.error('Search error:', err);
    
    const appError = createAppError(
      err?.message || 'Unknown search error',
      err,
      {
        type: err?.type || ErrorType.UNKNOWN,
        context: {
          coordinates,
          filters,
          searchRadius,
          ...context
        }
      }
    );
    
    errorRef.current = appError;
    
    searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
      coordinates,
      radius: searchRadius,
      filters,
      errorType: appError.type,
      errorMessage: appError.message,
      searchMethod: searchMethodRef.current
    });
    
    if (err?.message?.includes('get_nearby_applications') || 
        err?.message?.includes('Could not find the function')) {
      console.log('Not showing error for missing RPC function');
      return;
    }
    
    toast({
      title: "Search Error",
      description: appError.userMessage || "There was an issue with your search. Please try again.",
      variant: "destructive"
    });
  }, [toast, coordinates, filters, searchRadius]);
  
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  if (coordinates) {
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    const coordString = coordinates.join(',');
    
    if (
      queryKey.current[1] !== coordString || 
      queryKey.current[2] !== filterString || 
      queryKey.current[3] !== radiusString
    ) {
      queryKey.current = ['planning-applications', coordString, filterString, radiusString];
    }
  }
  
  useEffect(() => {
    if (!coordinates || !featureFlags.isEnabled(FeatureFlags.ENABLE_PROGRESSIVE_LOADING)) {
      return;
    }
    
    const cachedResults = featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE) ? 
      searchCache.get(coordinates, searchRadius, filters) : null;
    
    if (cachedResults && cachedResults.length > 0) {
      setProgressiveResults(cachedResults);
    } else {
      const quickSearchRadius = Math.max(1, Math.floor(searchRadius / 2));
      
      const performQuickSearch = async () => {
        try {
          const [lat, lng] = coordinates;
          
          searchMethodRef.current = 'fallback';
          const quickResults = await performFallbackSearch(lat, lng, quickSearchRadius, filters);
          
          if (quickResults.length > 0) {
            setProgressiveResults(quickResults);
          }
        } catch (err) {
          console.error('Quick search error:', err);
        } finally {
          setIsLoadingProgressive(false);
        }
      };
      
      performQuickSearch();
    }
  }, [coordinates, searchRadius, filters]);
  
  const { data: applications = [], isLoading, error: queryError } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, {
          coordinates,
          radius: searchRadius,
          filters
        });
        
        const [lat, lng] = coordinates;
        
        if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
          const cachedResults = searchCache.get(coordinates, searchRadius, filters);
          if (cachedResults) {
            console.log('Using cached results:', cachedResults.length);
            
            searchTelemetry.logEvent(TelemetryEventType.SEARCH_COMPLETED, {
              coordinates,
              radius: searchRadius,
              filters,
              resultCount: cachedResults.length,
              searchMethod: 'cache' as any
            });
            
            return cachedResults;
          }
        }
        
        let results: Application[] = [];
        
        if (featureFlags.isEnabled(FeatureFlags.USE_SPATIAL_SEARCH)) {
          console.log('Attempting spatial search first...');
          
          const spatialSearchFn = async () => {
            searchMethodRef.current = 'spatial';
            return await performSpatialSearch(lat, lng, searchRadius, filters);
          };
          
          let spatialResults: Application[] | null = null;
          
          if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
            try {
              spatialResults = await withRetry(spatialSearchFn, {
                maxRetries: 2,
                retryableErrors: (err) => {
                  const errMsg = err?.message?.toLowerCase() || '';
                  return (
                    errMsg.includes('network') ||
                    errMsg.includes('timeout') ||
                    errMsg.includes('too long')
                  );
                },
                onRetry: (err, attempt, delay) => {
                  console.log(`Retrying spatial search (attempt ${attempt}) in ${delay}ms`);
                }
              });
            } catch (err) {
              console.error('Spatial search failed after retries:', err);
              spatialResults = null;
            }
          } else {
            spatialResults = await performSpatialSearch(lat, lng, searchRadius, filters);
          }
          
          if (spatialResults !== null) {
            console.log('Using spatial search results:', spatialResults.length);
            results = spatialResults;
            
            searchTelemetry.logEvent(TelemetryEventType.SEARCH_COMPLETED, {
              coordinates,
              radius: searchRadius,
              filters,
              resultCount: spatialResults.length,
              searchMethod: 'spatial'
            });
            
            if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
              searchCache.set(coordinates, searchRadius, filters, spatialResults);
            }
            
            return spatialResults;
          }
        }
        
        console.log('Spatial search unavailable, using fallback search');
        
        const fallbackSearchFn = async () => {
          searchMethodRef.current = 'fallback';
          return await performFallbackSearch(lat, lng, searchRadius, filters);
        };
        
        if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
          results = await withRetry(fallbackSearchFn, {
            maxRetries: 2,
            retryableErrors: (err) => {
              const errMsg = err?.message?.toLowerCase() || '';
              return (
                errMsg.includes('network') ||
                errMsg.includes('timeout') ||
                errMsg.includes('too long')
              );
            },
            onRetry: (err, attempt, delay) => {
              console.log(`Retrying fallback search (attempt ${attempt}) in ${delay}ms`);
            }
          });
        } else {
          results = await fallbackSearchFn();
        }
        
        console.log('Got fallback results:', results.length);
        
        searchTelemetry.logEvent(TelemetryEventType.SEARCH_COMPLETED, {
          coordinates,
          radius: searchRadius,
          filters,
          resultCount: results.length,
          searchMethod: 'fallback'
        });
        
        if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
          searchCache.set(coordinates, searchRadius, filters, results);
        }
        
        return results;
      } catch (err) {
        handleSearchError(err);
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const error = queryError || errorRef.current;
  
  const finalApplications = (isLoading && progressiveResults.length > 0) 
    ? progressiveResults 
    : (applications || []);

  return {
    applications: finalApplications,
    isLoading: isLoading && !isLoadingProgressive,
    isLoadingProgressive,
    error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    progressiveResults: progressiveResults.length > 0
  };
};
