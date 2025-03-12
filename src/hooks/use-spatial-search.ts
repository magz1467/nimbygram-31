
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult, SEARCH_RADIUS, SEARCH_TIMEOUT } from '@/types/search';
import { Application } from '@/types/planning';

async function performSpatialSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    // Try spatial search first using PostGIS
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
        method: 'spatial',
        timing: {
          start: startTime,
          end: Date.now(),
          duration: Date.now() - startTime
        }
      };
    }

    // Fallback to bounding box search if spatial search returns no results
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
      method: 'fallback',
      timing: {
        start: startTime,
        end: Date.now(),
        duration: Date.now() - startTime
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export function useSpatialSearch(coordinates: SearchCoordinates | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => performSpatialSearch(coordinates!),
    enabled: !!coordinates,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
