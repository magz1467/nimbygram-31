
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult, SEARCH_RADIUS, SEARCH_TIMEOUT } from '@/types/search';
import { Application } from '@/types/planning';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { PostgrestResponse } from '@supabase/supabase-js';

async function performSpatialSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    // Try spatial search first using PostGIS
    const spatialPromise = new Promise<PostgrestResponse<any>>((resolve) => {
      supabase.rpc('get_nearby_applications', {
        center_lat: coordinates.lat,
        center_lng: coordinates.lng,
        radius_km: SEARCH_RADIUS
      }).then(response => resolve(response));
    });
    
    // Convert to Promise with withTimeout
    const result = await withTimeout<PostgrestResponse<any>>(
      spatialPromise, 
      SEARCH_TIMEOUT, 
      'Spatial search timeout'
    );

    if (result.error) throw result.error;

    if (result.data && result.data.length > 0) {
      return {
        applications: result.data as Application[],
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

    const fallbackPromise = new Promise<PostgrestResponse<any>>((resolve) => {
      supabase
        .from('crystal_roof')
        .select('*')
        .gte('latitude', coordinates.lat - latDiff)
        .lte('latitude', coordinates.lat + latDiff)
        .gte('longitude', coordinates.lng - lngDiff)
        .lte('longitude', coordinates.lng + lngDiff)
        .limit(100)
        .then(response => resolve(response));
    });
      
    // Convert to Promise with withTimeout
    const fallbackResult = await withTimeout<PostgrestResponse<any>>(
      fallbackPromise,
      SEARCH_TIMEOUT,
      'Fallback search timeout'
    );

    if (fallbackResult.error) throw fallbackResult.error;

    return {
      applications: fallbackResult.data || [],
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
