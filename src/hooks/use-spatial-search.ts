
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult, SEARCH_TIMEOUT } from '@/types/search';
import { Application } from '@/types/planning';
import { withTimeout } from '@/utils/coordinates/timeout-handler';

async function performSpatialSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  console.log('🔍 Starting spatial search with coordinates:', coordinates);
  
  const startTime = Date.now();
  
  try {
    // Direct RPC call - Supabase already returns a Promise
    const { data, error } = await withTimeout(
      supabase.rpc('get_nearby_applications', {
        latitude: coordinates[0],  // Using array index for lat
        longitude: coordinates[1], // Using array index for lng
        radius_km: 10
      }),
      SEARCH_TIMEOUT,
      'Spatial search timed out after 30 seconds'
    );

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      throw error;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Found ${data?.length || 0} applications in ${duration}ms`);
    
    const applications = data as Application[];
    
    return {
      applications,
      method: 'spatial',
      timing: {
        start: startTime,
        end: endTime,
        duration
      }
    };
  } catch (error) {
    console.error('❌ Spatial search failed:', error);
    throw error;
  }
}

export function useSpatialSearch(coordinates: SearchCoordinates | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => {
      if (!coordinates) {
        throw new Error('No coordinates provided for spatial search');
      }
      return performSpatialSearch(coordinates);
    },
    enabled: !!coordinates,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 1000 * 60 * 5,
  });
}
