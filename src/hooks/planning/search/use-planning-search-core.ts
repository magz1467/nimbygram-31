
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { SearchFilters } from './types';
import { useSearchCoordinator } from './use-search-coordinator';
import { useSearchQuery } from './use-search-query';
import { useSearchCompletionHandler } from './use-search-completion-handler';

/**
 * Simplified core implementation of the planning search hook
 */
export function usePlanningSearchCore(coordinates: [number, number] | null) {
  const [filters, setFilters] = useState<SearchFilters>({});
  // Always use 5km radius for simplicity
  const searchRadius = 5;
  
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

  return {
    applications: applications || [],
    hasResults: searchState.hasResults,
    isLoading: searchState.isLoading,
    isFetching,
    error: searchState.error,
    filters,
    setFilters,
    searchRadius,
    // We don't need setSearchRadius anymore since we're using a fixed radius
    searchState
  };
}
