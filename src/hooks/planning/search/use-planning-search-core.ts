
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
    stage,
    progress,
    error: coordinatorError,
    method,
    results: coordinatorResults,
    hasResults,
    updateProgress,
    updateMethod,
    queryStartTimeRef
  } = useSearchCoordinator(coordinates, filters);
  
  // Execute the main search query
  const {
    data: applications = [],
    isFetching,
    error: queryError,
    isLoading: isQueryLoading
  } = useSearchQuery(
    queryKey,
    debouncedCoordinates,
    filters,
    queryStartTimeRef,
    {
      onProgress: updateProgress,
      onMethodChange: updateMethod,
      onError: (error) => {
        console.error('Search query error:', error);
      }
    }
  );

  // Combine loading states
  const isLoading = isFetching || isQueryLoading;
  
  // Combine errors
  const error = queryError || coordinatorError;

  return {
    applications,
    hasResults: applications.length > 0,
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
