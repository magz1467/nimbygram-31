
import { useQuery } from '@tanstack/react-query';
import { executeSearch } from './search-executor';
import { Application } from '@/types/planning';
import { SearchFilters } from './types';
import { useSearchErrorHandler } from './use-search-error-handler';

/**
 * Hook to execute the main search query with proper error handling
 */
export function useSearchQuery(
  queryKey: string[],
  debouncedCoordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters,
  queryStartTimeRef: React.MutableRefObject<number>,
  options: {
    onProgress: (stage: string, progress: number) => void,
    onMethodChange: (method: string) => void,
    onSuccess: (applications: Application[]) => void,
    onError: (error: Error) => void
  }
) {
  const { handleSearchError } = useSearchErrorHandler(
    debouncedCoordinates, 
    searchRadius, 
    filters
  );
  
  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!debouncedCoordinates) return [];
      
      try {
        queryStartTimeRef.current = Date.now();
        console.log(`🔍 useSearchQuery query started`, {
          coordinates: debouncedCoordinates,
          radius: searchRadius,
          filters: Object.keys(filters),
          time: new Date().toISOString(),
          queryKey: queryKey,
        });
        
        options.onProgress('coordinates', 10);
        
        const result = await executeSearch(
          { coordinates: debouncedCoordinates, radius: searchRadius, filters },
          {
            onProgress: options.onProgress,
            onMethodChange: options.onMethodChange
          }
        );
        
        // Process the results
        options.onProgress('processing', 90);
        
        console.log(`✅ useSearchQuery query completed`, {
          method: result.method,
          resultCount: result.applications.length,
          duration: Date.now() - queryStartTimeRef.current,
          time: new Date().toISOString(),
        });
        
        // Update results in the search state manager
        options.onSuccess(result.applications);
        
        return result.applications;
      } catch (err) {
        console.error(`❌ useSearchQuery query error:`, err);
        handleSearchError(err);
        
        // Mark the search as failed
        options.onError(err instanceof Error ? err : new Error(String(err)));
        
        return [];
      }
    },
    enabled: !!debouncedCoordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
