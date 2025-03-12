
import { useEffect } from 'react';
import { Application } from '@/types/planning';
import { useSearchTelemetry } from './use-search-telemetry';
import { SearchFilters, SearchMethod } from './types';

/**
 * Hook to handle search completion and telemetry logging
 */
export function useSearchCompletionHandler(
  debouncedCoordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters,
  applications: Application[],
  searchMethod: SearchMethod | null,
  isLoading: boolean,
  searchComplete: () => void
) {
  const { logSearchCompleted } = useSearchTelemetry();
  
  // Log telemetry when search completes
  useEffect(() => {
    if (!isLoading && debouncedCoordinates && applications.length > 0 && searchMethod) {
      // Log telemetry data about the search
      logSearchCompleted(
        debouncedCoordinates,
        searchRadius,
        filters,
        applications.length,
        searchMethod
      );
      
      // Mark search as complete
      searchComplete();
    }
  }, [
    debouncedCoordinates, 
    searchRadius, 
    filters, 
    applications, 
    searchMethod, 
    isLoading, 
    logSearchCompleted, 
    searchComplete
  ]);
}
