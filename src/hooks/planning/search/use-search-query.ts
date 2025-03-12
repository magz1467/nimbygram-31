
import { useQuery } from '@tanstack/react-query';
import { executeSearch } from './search-executor';
import { Application } from '@/types/planning';
import { SearchFilters } from './types';
import { useSearchErrorHandler } from './use-search-error-handler';

export function useSearchQuery(
  queryKey: string[],
  debouncedCoordinates: [number, number] | null,
  filters: SearchFilters,
  queryStartTimeRef: React.MutableRefObject<number>,
  options: {
    onProgress: (stage: string, progress: number) => void,
    onMethodChange: (method: string) => void,
    onError: (error: Error) => void
  }
) {
  const { handleSearchError } = useSearchErrorHandler(
    debouncedCoordinates, 
    filters
  );
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!debouncedCoordinates) {
        console.log('No coordinates available, skipping search');
        return [];
      }
      
      try {
        console.log('Starting search with coordinates:', debouncedCoordinates);
        queryStartTimeRef.current = Date.now();
        
        options.onProgress('coordinates', 10);
        
        const result = await executeSearch(
          { coordinates: debouncedCoordinates, radius: 5, filters },
          {
            onProgress: options.onProgress,
            onMethodChange: options.onMethodChange
          }
        );
        
        console.log('Search completed successfully:', {
          method: result.method,
          resultCount: result.applications.length
        });
        
        return result.applications;
      } catch (err) {
        console.error('Search query failed:', err);
        handleSearchError(err);
        options.onError(err instanceof Error ? err : new Error(String(err)));
        return [];
      }
    },
    enabled: !!debouncedCoordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}
