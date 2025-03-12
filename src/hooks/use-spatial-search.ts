
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchResult, SearchCoordinates } from '@/types/search';
import { Application } from '@/types/planning';

const SEARCH_TIMEOUT = 30000; // 30 seconds
const SEARCH_RADIUS = 5; // 5km

async function executeSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    // Try spatial search first
    const { data: spatialData, error: spatialError } = await Promise.race([
      supabase.rpc('get_nearby_applications', {
        center_lat: coordinates.lat,
        center_lng: coordinates.lng,
        radius_km: SEARCH_RADIUS
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Spatial search timeout')), SEARCH_TIMEOUT)
      )
    ]);

    if (spatialError) throw spatialError;
    
    if (spatialData) {
      return {
        applications: spatialData as Application[],
        total: spatialData.length,
        method: 'spatial',
        timing: {
          start: startTime,
          end: Date.now(),
          duration: Date.now() - startTime
        }
      };
    }

    // If spatial search fails, try fallback search
    const latDiff = SEARCH_RADIUS / 111.32; // approx km per degree
    const lngDiff = SEARCH_RADIUS / (111.32 * Math.cos(coordinates.lat * (Math.PI / 180)));

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', coordinates.lat - latDiff)
      .lte('latitude', coordinates.lat + latDiff)
      .gte('longitude', coordinates.lng - lngDiff)
      .lte('longitude', coordinates.lng + lngDiff)
      .limit(100);

    if (fallbackError) throw fallbackError;

    return {
      applications: fallbackData || [],
      total: fallbackData?.length || 0,
      method: 'fallback',
      timing: {
        start: startTime,
        end: Date.now(),
        duration: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      applications: [],
      total: 0,
      method: 'error',
      timing: {
        start: startTime,
        end: Date.now(),
        duration: Date.now() - startTime
      }
    };
  }
}

export function useSpatialSearch(coordinates: SearchCoordinates | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => executeSearch(coordinates!),
    enabled: !!coordinates,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
