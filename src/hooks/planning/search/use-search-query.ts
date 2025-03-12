
import { useQuery } from '@tanstack/react-query';
import { executeSearch } from './search-executor';
import { Application } from '@/types/planning';
import { SearchFilters, SearchResult } from './types';
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
  
  return useQuery<SearchResult>({
    queryKey,
    queryFn: async () => {
      if (!debouncedCoordinates) {
        console.log('No coordinates available, skipping search');
        return { applications: [], method: 'none' };
      }
      
      try {
        console.log('Starting search with coordinates:', debouncedCoordinates);
        queryStartTimeRef.current = Date.now();
        
        options.onProgress('coordinates', 10);
        
        const result = await executeSearch(
          { lat: debouncedCoordinates[0], lng: debouncedCoordinates[1], radius: 5, filters },
          {
            onProgress: options.onProgress,
            onMethodChange: options.onMethodChange
          }
        );
        
        console.log('Search completed successfully:', {
          method: result.method,
          resultCount: result.applications.length
        });
        
        return result;
      } catch (err) {
        console.error('Search query failed:', err);
        const error = handleSearchError(err);
        options.onError(error);
        return { applications: [], method: 'error' };
      }
    },
    enabled: !!debouncedCoordinates,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}
