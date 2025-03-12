
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult } from '@/types/search';
import { Application } from '@/types/planning';

async function performSpatialSearch(coordinates: SearchCoordinates | [number, number]): Promise<SearchResult> {
  console.log('🔍 Starting spatial search with coordinates:', coordinates);
  
  const startTime = Date.now();
  
  try {
    // Handle both array and object formats
    const [lat, lng] = Array.isArray(coordinates) 
      ? coordinates 
      : [coordinates.lat, coordinates.lng];
    
    console.log(`🔍 Using coordinates for RPC call: lat=${lat}, lng=${lng}`);
    
    const { data, error } = await supabase
      .rpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        radius_km: 10
      });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      throw new Error(`Spatial search failed: ${error.message}`);
    }

    if (!data) {
      console.warn('⚠️ No data returned from spatial search');
      return {
        applications: [],
        method: 'spatial',
        timing: {
          start: startTime,
          end: Date.now(),
          duration: Date.now() - startTime
        }
      };
    }

    console.log(`✅ Spatial search found ${data.length} applications`);
    console.log('First few results:', data.slice(0, 3));

    const applications = data as Application[];
    
    return {
      applications,
      method: 'spatial',
      timing: {
        start: startTime,
        end: Date.now(),
        duration: Date.now() - startTime
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
    retry: false // Don't retry on failure so we can see errors
  });
}
