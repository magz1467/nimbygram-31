
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult, SEARCH_TIMEOUT } from '@/types/search';
import { Application } from '@/types/planning';
import { withTimeout } from '@/utils/coordinates/timeout-handler';

async function performSpatialSearch(coordinates: SearchCoordinates | [number, number]): Promise<SearchResult> {
  console.log('🔍 Starting spatial search with coordinates:', coordinates);
  
  const startTime = Date.now();
  
  try {
    // Handle both array and object formats
    const [lat, lng] = Array.isArray(coordinates) 
      ? coordinates 
      : [coordinates.lat, coordinates.lng];
    
    console.log(`🔍 Using coordinates: lat=${lat}, lng=${lng}`);
    
    const { data, error } = await supabase.rpc('get_nearby_applications', {
      latitude: lat,
      longitude: lng,
      radius_km: 10
    });

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

export function useSpatialSearch(coordinates: SearchCoordinates | [number, number] | null) {
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
