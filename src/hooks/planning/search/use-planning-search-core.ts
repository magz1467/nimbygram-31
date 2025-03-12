
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { SearchFilters } from './types';
import { useSearchCoordinator } from './use-search-coordinator';
import { useSearchQuery } from './use-search-query';
import { useSearchCompletionHandler } from './use-search-completion-handler';

/**
 * Simplified core implementation of the planning search hook with fixed 5km radius
 */
export function usePlanningSearchCore(coordinates: [number, number] | null) {
  const [filters, setFilters] = useState<SearchFilters>({});
  // Always use 5km radius - no need for state or props
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
  } = useSearchCoordinator(coordinates, filters);
  
  // Execute the main search query
  const {
    data: applications = [],
    isFetching
  } = useSearchQuery(
    queryKey,
    debouncedCoordinates,
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
    searchState
  };
}
