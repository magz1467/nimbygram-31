
import { useCallback } from 'react';
import { SearchFilters } from './types';
import { formatErrorMessage } from '@/utils/errors';

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
    // Properly format the error message
    const errorMessage = formatErrorMessage(error);
    
    console.error(`Search error handler: ${errorMessage}`, {
      coordinates,
      filterCount: Object.keys(filters).length,
    });
    
    // Extract additional details for Supabase errors
    let enhancedMessage = errorMessage;
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const supabaseError = error as any;
      enhancedMessage = `${supabaseError.message || 'Database error'}`;
      
      if (supabaseError.hint) {
        console.log(`Error hint: ${supabaseError.hint}`);
      }
      
      if (supabaseError.code === 'PGRST202') {
        return new Error('Database configuration issue. Our team has been notified and is working on it.');
      }
    }
    
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
    
    // If it's a function not found error, provide a clear message
    if (errorMessage.includes('function') && errorMessage.includes('not found')) {
      return new Error('Search system unavailable. Our team has been notified of this issue.');
    }
    
    return new Error(enhancedMessage);
  }, [coordinates, filters]);

  return { handleSearchError };
}
