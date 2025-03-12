
import { useEffect } from 'react';
import { Application } from '@/types/planning';
import { useProgressiveSearch } from './progressive-search';
import { SearchFilters } from './types';

/**
 * Hook to manage fallback results when main search is loading or encounters errors
 */
export function useSearchFallback(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters,
  isLoading: boolean,
  hasError: boolean,
  setResults: (applications: Application[]) => void
) {
  // Use progressive search for quick initial results
  const { results: progressiveResults, isLoading: isLoadingProgressive } = 
    useProgressiveSearch(coordinates, searchRadius, filters);
    
  // If main search is loading or has error, use progressive results as fallback
  useEffect(() => {
    if ((isLoading || hasError) && progressiveResults.length > 0) {
      console.log(`⚠️ useSearchFallback using fallback results`, {
        count: progressiveResults.length,
        isLoading,
        hasError,
        time: new Date().toISOString(),
      });
      
      // Update results with progressive results
      setResults(progressiveResults);
    }
  }, [progressiveResults, isLoading, hasError, setResults]);
  
  return {
    progressiveResults,
    isLoadingProgressive,
    hasProgressiveResults: progressiveResults.length > 0
  };
}
