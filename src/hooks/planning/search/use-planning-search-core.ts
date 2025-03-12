
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
  
  // Get search coordination functions
  const {
    debouncedCoordinates,
    queryKey,
    isLoading,
    stage,
    progress,
    error,
    method,
    results,
    hasResults,
    updateProgress,
    updateMethod,
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
      onMethodChange: updateMethod,
      onSuccess: (apps) => {
        // We directly use the applications data from the query
        // No need for separate setResults since useSearchCoordinator manages this
      },
      onError: (error) => {
        // Error handling is managed by useSearchCoordinator
      }
    }
  );
  
  // Handle search completion telemetry
  useSearchCompletionHandler(
    debouncedCoordinates,
    filters,
    applications,
    method,
    isLoading,
    () => {
      // Search completion is handled by the coordinator
    }
  );
  
  // When we get applications from the query, update our results
  useEffect(() => {
    if (applications && applications.length > 0) {
      // Results are managed by useSearchCoordinator
    }
  }, [applications]);

  return {
    applications: applications || [],
    hasResults,
    isLoading,
    isFetching,
    error,
    filters,
    setFilters,
    searchRadius: 5, // Fixed at 5km
    searchState: {
      stage,
      progress,
      method,
      error
    }
  };
}
