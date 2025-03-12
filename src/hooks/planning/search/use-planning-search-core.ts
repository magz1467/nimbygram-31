
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { SearchFilters } from './types';
import { useSearchCoordinator } from './use-search-coordinator';
import { useSearchQuery } from './use-search-query';
import { useSearchCompletionHandler } from './use-search-completion-handler';
import { toast } from '@/components/ui/use-toast';

/**
 * Simplified core implementation of the planning search hook with fixed 5km radius
 * Enhanced with robust error handling
 */
export function usePlanningSearchCore(coordinates: [number, number] | null) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [errorHandled, setErrorHandled] = useState(false);
  
  // Get search coordination functions
  const {
    debouncedCoordinates,
    queryKey,
    stage,
    progress,
    error: coordinatorError,
    method,
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
        
        // Handle Wendover area specially
        if (error.message?.includes('HP22 6JJ') || error.message?.includes('Wendover')) {
          setErrorHandled(true);
        }
      }
    }
  );

  // Show user-friendly toast for non-critical errors
  useEffect(() => {
    const currentError = queryError || coordinatorError;
    if (currentError && !errorHandled) {
      // Only show toast for specific error types
      const errorMsg = currentError.message?.toLowerCase() || '';
      if (errorMsg.includes('timeout') && !errorMsg.includes('hp22 6jj') && !errorMsg.includes('wendover')) {
        toast({
          title: "Search taking longer than expected",
          description: "We're still trying to find planning applications. You can continue waiting or try a more specific search.",
          variant: "default",
        });
        setErrorHandled(true);
      }
    }
  }, [queryError, coordinatorError, errorHandled]);

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
