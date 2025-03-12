
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { SearchFilters, SearchMethod } from './types';
import { useSearchCoordinator } from './use-search-coordinator';
import { useSearchQuery } from './use-search-query';
import { useSearchFallback } from './use-search-fallback';
import { useSearchCompletionHandler } from './use-search-completion-handler';

/**
 * Core implementation of the planning search hook
 */
export function usePlanningSearchCore(coordinates: [number, number] | null) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  
  // Get search coordination functions
  const {
    debouncedCoordinates,
    queryKey,
    searchState,
    updateProgress,
    setSearchMethod,
    setResults,
    completeSearch,
    failSearch,
    queryStartTimeRef
  } = useSearchCoordinator(coordinates, searchRadius, filters);
  
  // Execute the main search query
  const {
    data: applications = [],
    isFetching
  } = useSearchQuery(
    queryKey,
    debouncedCoordinates,
    searchRadius,
    filters,
    queryStartTimeRef,
    {
      onProgress: updateProgress,
      onMethodChange: setSearchMethod,
      onSuccess: (apps) => setResults(apps),
      onError: (error) => failSearch(error)
    }
  );
  
  // Set up fallback handling with progressive search
  const {
    progressiveResults,
    isLoadingProgressive,
    hasProgressiveResults
  } = useSearchFallback(
    debouncedCoordinates,
    searchRadius,
    filters,
    searchState.isLoading,
    !!searchState.error,
    setResults
  );
  
  // Handle search completion telemetry
  useSearchCompletionHandler(
    debouncedCoordinates,
    searchRadius,
    filters,
    applications,
    searchState.method,
    searchState.isLoading,
    completeSearch
  );
  
  // When we get applications from the query, update our results
  useEffect(() => {
    if (applications && applications.length > 0) {
      setResults(applications);
    }
  }, [applications, setResults]);

  // Use progressive results while waiting for main search
  const finalApplications = (searchState.isLoading && progressiveResults.length > 0) 
    ? progressiveResults 
    : (applications || []);

  return {
    applications: finalApplications,
    hasResults: searchState.hasResults,
    isLoading: searchState.isLoading,
    isFetching,
    isLoadingProgressive,
    error: searchState.error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    searchState,
    progressiveResults: hasProgressiveResults
  };
}
