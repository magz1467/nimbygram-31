
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Application } from "@/types/planning";
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import type { SearchFilters, SearchMethod } from './search/types';
import { useProgressiveSearch } from './search/progressive-search';
import { useSearchErrorHandler } from './search/use-search-error-handler';
import { useSearchTelemetry } from './search/use-search-telemetry';
import { executeSearch } from './search/search-executor';

export type { SearchFilters } from './search/types';

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [hasResults, setHasResults] = useState<boolean>(false);
  
  const { logSearchCompleted } = useSearchTelemetry();
  const { handleSearchError, errorRef, searchMethodRef } = useSearchErrorHandler(
    coordinates, 
    searchRadius, 
    filters
  );
  
  const { results: progressiveResults, isLoading: isLoadingProgressive } = 
    useProgressiveSearch(coordinates, searchRadius, filters);
  
  const componentId = useRef(`search-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const queryStartTimeRef = useRef<number>(0);
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  // Track renders
  renderCountRef.current += 1;
  
  // Log mount information
  useEffect(() => {
    console.log(`🔎 usePlanningSearch [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      hasCoordinates: !!coordinates,
      coordinates: coordinates?.join(',') || 'none',
    });
    
    return () => {
      console.log(`🔎 usePlanningSearch [${componentId}] UNMOUNTED after ${renderCountRef.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
      });
    };
  }, [componentId, coordinates]);
  
  if (coordinates) {
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    const coordString = coordinates.join(',');
    
    // Only update the query key if the search parameters have changed
    if (
      queryKey.current[1] !== coordString || 
      queryKey.current[2] !== filterString || 
      queryKey.current[3] !== radiusString
    ) {
      const oldKey = [...queryKey.current];
      queryKey.current = ['planning-applications', coordString, filterString, radiusString];
      console.log(`🔑 usePlanningSearch [${componentId}] query key changed`, {
        from: oldKey,
        to: queryKey.current,
        renderCount: renderCountRef.current
      });
    }
  }
  
  const {
    data: applications = [],
    isLoading,
    isFetching,
    error: queryError
  } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        queryStartTimeRef.current = Date.now();
        console.log(`🔍 usePlanningSearch [${componentId}] query started`, {
          coordinates,
          radius: searchRadius,
          filters: Object.keys(filters),
          time: new Date().toISOString(),
          queryKey: queryKey.current,
        });
        
        const result = await executeSearch(
          { coordinates, radius: searchRadius, filters },
          searchMethodRef
        );
        
        console.log(`✅ usePlanningSearch [${componentId}] query completed`, {
          method: result.method,
          resultCount: result.applications.length,
          duration: Date.now() - queryStartTimeRef.current,
          time: new Date().toISOString(),
        });
        
        // Log telemetry data about the search
        logSearchCompleted(
          coordinates,
          searchRadius,
          filters,
          result.applications.length,
          result.method
        );
        
        // Update the hasResults state based on whether we got any results
        setHasResults(result.applications.length > 0);
        
        return result.applications;
      } catch (err) {
        console.error(`❌ usePlanningSearch [${componentId}] query error:`, err);
        handleSearchError(err);
        
        const fallbackResults = progressiveResults.length > 0 ? progressiveResults : [];
        console.log(`⚠️ usePlanningSearch [${componentId}] using fallback results`, {
          count: fallbackResults.length,
          time: new Date().toISOString(),
        });
        
        return fallbackResults;
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Track when query state changes
  useEffect(() => {
    console.log(`🔄 usePlanningSearch [${componentId}] query state change`, {
      isLoading,
      isFetching,
      hasError: !!queryError,
      applicationCount: applications?.length || 0,
      renderCount: renderCountRef.current,
      time: new Date().toISOString(),
    });
  }, [isLoading, isFetching, queryError, applications, componentId]);

  // Once we have results, we want to maintain them even if there's an error
  useEffect(() => {
    if (applications && applications.length > 0) {
      setHasResults(true);
    }
  }, [applications]);

  const error = queryError || errorRef.current;
  
  // If we have progressive results and we're loading, use those to show something to the user
  const finalApplications = (isLoading && progressiveResults.length > 0) 
    ? progressiveResults 
    : (applications || []);

  return {
    applications: finalApplications,
    hasResults,
    isLoading: isLoading && !isLoadingProgressive,
    isFetching,
    isLoadingProgressive,
    error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    progressiveResults: progressiveResults.length > 0
  };
};
