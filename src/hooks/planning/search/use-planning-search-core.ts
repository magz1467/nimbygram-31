
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
        
        // More robust error handling for specific errors
        const errorMsg = error?.message || String(error);
        const isSupabaseError = typeof error === 'object' && error !== null && 'code' in error;
        
        if (isSupabaseError) {
          // Handle specific Supabase errors more gracefully
          const supabaseError = error as any;
          console.error('Supabase error details:', {
            code: supabaseError.code,
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint
          });
          
          // If there's a helpful hint, use it
          if (supabaseError.hint) {
            console.log('Supabase provided hint:', supabaseError.hint);
          }
        }
      }
    }
  );

  // Show user-friendly toast for non-critical errors
  useEffect(() => {
    const currentError = queryError || coordinatorError;
    if (currentError && !errorHandled) {
      // Format the error message properly
      const errorMsg = typeof currentError === 'object' && currentError !== null 
        ? (currentError.message || JSON.stringify(currentError))
        : String(currentError);
      
      console.log('Error message for toast consideration:', errorMsg);
      
      // Only show toast for specific error types
      if (errorMsg.includes('timeout') || errorMsg.includes('could not find')) {
        toast({
          title: "Search issue detected",
          description: "We're having trouble finding planning applications. Please try again in a moment.",
          variant: "destructive",
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
