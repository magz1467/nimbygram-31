import { useEffect, useRef } from 'react';
import { Application } from '@/types/planning';
import { SearchFilters, SearchMethod } from './types';

/**
 * Simple hook to handle search completion telemetry
 * Using fixed 5km radius
 */
export function useSearchCompletionHandler(
  coordinates: [number, number] | null,
  filters: SearchFilters,
  applications: Application[],
  searchMethod: SearchMethod | null,
  isLoading: boolean,
  onComplete: () => void
) {
  const hasCalledComplete = useRef(false);
  const previousResults = useRef<Application[]>([]);
  
  // Reset when coordinates change
  useEffect(() => {
    if (coordinates) {
      hasCalledComplete.current = false;
    }
  }, [coordinates]);
  
  // Call onComplete when search finishes with results
  useEffect(() => {
    const hasResults = applications && applications.length > 0;
    const resultsChanged = previousResults.current !== applications;
    
    // Keep track of the latest results
    previousResults.current = applications;
    
    // Only call onComplete when:
    // 1. We have results
    // 2. We're not currently loading
    // 3. We have a search method (search was performed)
    // 4. We haven't already called onComplete for this search
    if (hasResults && !isLoading && searchMethod && !hasCalledComplete.current) {
      console.log('Search completion handler: Calling onComplete', {
        resultCount: applications.length,
        method: searchMethod,
      });
      
      hasCalledComplete.current = true;
      onComplete();
    }
  }, [applications, isLoading, searchMethod, onComplete]);
  
  return null;
}
