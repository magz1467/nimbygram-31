
import { useCallback } from 'react';
import { SearchFilters } from './types';

/**
 * Hook to handle search errors with appropriate user messaging
 * Using fixed 5km radius
 */
export function useSearchErrorHandler(
  coordinates: [number, number] | null,
  filters: SearchFilters
) {
  // Process search errors to provide more user-friendly messages
  const handleSearchError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`Search error handler: ${errorMessage}`, {
      coordinates,
      filterCount: Object.keys(filters).length,
    });
    
    // Determine if this is a timeout error
    const isTimeout = 
      errorMessage.includes('timeout') || 
      errorMessage.includes('abort') || 
      errorMessage.includes('cancelled');
    
    // Create a more specific error for timeouts
    if (isTimeout) {
      const area = coordinates ? `[${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}]` : 'unknown';
      console.warn(`Search timeout detected for area: ${area}`);
      return new Error(`The search took too long to complete. This area may have too many planning applications. Please try a more specific location.`);
    }
    
    return error;
  }, [coordinates, filters]);

  return { handleSearchError };
}
