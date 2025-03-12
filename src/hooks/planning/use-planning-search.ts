
import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';

export interface SearchFilters {
  status?: string;
  type?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const { toast } = useToast();
  const errorRef = useRef<Error | null>(null);
  const hasShownErrorToast = useRef<boolean>(false);
  const hasPartialResults = useRef<boolean>(false);
  const isSearchInProgress = useRef<boolean>(false);
  
  // Reset error toast flag when coordinates change
  useEffect(() => {
    hasShownErrorToast.current = false;
    hasPartialResults.current = false;
    isSearchInProgress.current = false;
  }, [coordinates, searchRadius, JSON.stringify(filters)]);
  
  // Function to handle search errors
  const handleSearchError = useCallback((err: any) => {
    console.error('Search error:', err);
    errorRef.current = err instanceof Error ? err : new Error(String(err));
    
    // Don't show errors for missing function
    if (err?.message?.includes('get_nearby_applications') || 
        err?.message?.includes('Could not find the function')) {
      console.log('Not showing error for missing RPC function');
      return;
    }
    
    // Don't show toast for timeouts if we have partial results
    if (hasPartialResults.current) {
      console.log('Not showing error toast because we have partial results');
      return;
    }
    
    // Don't show timeout errors as toast messages unless we have no results
    if (err?.message?.includes('timeout') || 
        err?.message?.includes('canceling statement') ||
        err?.message?.includes('57014')) {
      console.log('Not showing toast for timeout error');
      return;
    }
    
    // Only show toast once per search
    if (!hasShownErrorToast.current) {
      toast({
        title: "Search in Progress",
        description: "Your search is taking longer than expected. We'll show results as they become available.",
        variant: "default",
      });
      hasShownErrorToast.current = true;
    }
  }, [toast]);
  
  // Create a stable query key
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
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
      queryKey.current = ['planning-applications', coordString, filterString, radiusString];
    }
  }
  
  const { data: applications = [], isLoading, error: queryError, isFetching } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        isSearchInProgress.current = true;
        
        const [lat, lng] = coordinates;
        let results: Application[] = [];
        
        // First try spatial search (with PostGIS)
        console.log('Attempting spatial search first...');
        const spatialResults = await performSpatialSearch(lat, lng, searchRadius, filters);
        
        // If spatial search returns results or empty array (not null), use those results
        if (spatialResults !== null) {
          console.log('Using spatial search results:', spatialResults.length);
          
          // If we got some results, mark as having partial results
          if (spatialResults.length > 0) {
            hasPartialResults.current = true;
          }
          
          return spatialResults;
        }
        
        // If spatial search returns null (indicating failure/unavailability), use fallback
        console.log('Spatial search unavailable, using fallback search');
        const fallbackResults = await performFallbackSearch(lat, lng, searchRadius, filters);
        console.log('Got fallback results:', fallbackResults.length);
        
        // If we got some results from fallback, mark as having partial results
        if (fallbackResults.length > 0) {
          hasPartialResults.current = true;
        }
        
        return fallbackResults;
      } catch (err) {
        handleSearchError(err);
        // Return empty array to prevent component crashes
        return [];
      } finally {
        // After a delay, mark search as no longer in progress
        // This helps prevent UI from flickering "no results" too early
        setTimeout(() => {
          isSearchInProgress.current = false;
        }, 2000);
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Set progressive loading behavior
    placeholderData: (previousData) => previousData || [],
    // Custom timeout handling
    meta: {
      onError: (error: Error) => {
        handleSearchError(error);
      },
    },
  });

  // Combine stored error with query error
  const error = queryError || errorRef.current;

  return {
    applications: applications || [],
    isLoading: isLoading || isFetching,
    isSearchInProgress: isSearchInProgress.current,
    hasPartialResults: hasPartialResults.current,
    error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius
  };
};
