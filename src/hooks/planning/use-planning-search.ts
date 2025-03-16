
import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { executeSearchStrategy } from './search/search-strategy';
import { postcodeToCoordinates } from './search/postcode-utils';
import { useSearchErrorHandler } from './search/search-error-handler';
import { SearchFilters, PlanningSearchResult } from './search/types';

export type { SearchFilters } from './search/types';

export const usePlanningSearch = (searchParam: [number, number] | string | null): PlanningSearchResult => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const { handleSearchError } = useSearchErrorHandler();
  const errorRef = useRef<Error | null>(null);
  const hasShownErrorToast = useRef<boolean>(false);
  const hasPartialResults = useRef<boolean>(false);
  const isSearchInProgress = useRef<boolean>(false);
  
  // Reset error toast flag when search parameters change
  useEffect(() => {
    hasShownErrorToast.current = false;
    hasPartialResults.current = false;
    isSearchInProgress.current = false;
  }, [searchParam, searchRadius, JSON.stringify(filters)]);
  
  // Create a stable query key
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  if (searchParam) {
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    
    // Generate a consistent query key string based on the type of searchParam
    const searchParamString = typeof searchParam === 'string' 
      ? `postcode:${searchParam}` 
      : `coords:${searchParam.join(',')}`;
    
    // Only update the query key if the search parameters have changed
    if (
      queryKey.current[1] !== searchParamString || 
      queryKey.current[2] !== filterString || 
      queryKey.current[3] !== radiusString
    ) {
      queryKey.current = ['planning-applications', searchParamString, filterString, radiusString];
    }
  }
  
  const { data: applications = [], isLoading, error: queryError, isFetching } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!searchParam) return [];
      
      try {
        console.log('Searching with param:', searchParam, 'radius:', searchRadius);
        isSearchInProgress.current = true;
        
        let lat: number;
        let lng: number;
        
        // Handle both string (postcode) and coordinates
        if (typeof searchParam === 'string') {
          // If searchParam is a postcode, fetch its coordinates first
          console.log('Searching with postcode:', searchParam);
          
          try {
            [lat, lng] = await postcodeToCoordinates(searchParam);
            console.log(`Converted postcode to coordinates:`, lat, lng);
          } catch (postcodeError) {
            console.error(`Error converting postcode to coordinates:`, postcodeError);
            throw postcodeError;
          }
        } else {
          // If searchParam is already coordinates, use it directly
          [lat, lng] = searchParam;
        }
        
        // Execute the search strategy
        const results = await executeSearchStrategy(lat, lng, searchRadius, filters);
        
        // If we got some results, mark as having partial results
        if (results.length > 0) {
          hasPartialResults.current = true;
        }
        
        return results;
      } catch (err) {
        handleSearchError(err, hasPartialResults.current);
        errorRef.current = err instanceof Error ? err : new Error(String(err));
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
    enabled: !!searchParam,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Set progressive loading behavior
    placeholderData: (previousData) => previousData || [],
    // Custom error handling
    meta: {
      onError: (error: Error) => {
        handleSearchError(error, hasPartialResults.current);
      },
    },
  });

  // Combined filter setter that creates a new object
  const setFiltersHandler = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Combine stored error with query error
  const error = queryError || errorRef.current;

  return {
    applications: applications || [],
    isLoading: isLoading || isFetching,
    isSearchInProgress: isSearchInProgress.current,
    hasPartialResults: hasPartialResults.current,
    error,
    filters,
    setFilters: setFiltersHandler,
    searchRadius,
    setSearchRadius
  };
};
