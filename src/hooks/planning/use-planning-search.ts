
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
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        const result = await executeSearch(
          { coordinates, radius: searchRadius, filters },
          searchMethodRef as React.MutableRefObject<'spatial' | 'fallback' | 'cache' | null>
        );
        
        // Log telemetry data about the search
        logSearchCompleted(
          coordinates,
          searchRadius,
          filters,
          result.applications.length,
          result.searchMethod
        );
        
        // Update the hasResults state based on whether we got any results
        setHasResults(result.applications.length > 0);
        
        return result.applications;
      } catch (err) {
        handleSearchError(err);
        return progressiveResults.length > 0 ? progressiveResults : [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

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
