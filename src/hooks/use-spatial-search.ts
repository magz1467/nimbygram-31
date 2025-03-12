
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult } from '@/types/search';
import { Application } from '@/types/planning';

/**
 * Performs a spatial search for planning applications near the given coordinates
 * @param coordinates Latitude and longitude coordinates to search around
 * @returns Promise with search results
 */
async function performSpatialSearch(coordinates: SearchCoordinates | [number, number]): Promise<SearchResult> {
  console.log('🔍 [performSpatialSearch] Starting search with coordinates:', coordinates);
  
  const startTime = Date.now();
  
  try {
    // Handle both array and object formats
    const [lat, lng] = Array.isArray(coordinates) 
      ? coordinates 
      : [coordinates.lat, coordinates.lng];
    
    console.log(`🔍 [performSpatialSearch] Normalized coordinates: lat=${lat}, lng=${lng}`);
    
    // Additional validation logging
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ [performSpatialSearch] Invalid coordinates detected:', { lat, lng });
      throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
    }
    
    console.log(`🔍 [performSpatialSearch] Calling Supabase RPC 'get_nearby_applications' with params:`, { 
      latitude: lat, 
      longitude: lng, 
      radius_km: 10 
    });
    
    // Start the Supabase RPC call
    const { data, error } = await supabase
      .rpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        radius_km: 10
      });

    // Log the raw response for debugging
    console.log('🔍 [performSpatialSearch] Raw Supabase response:', { data, error });

    if (error) {
      console.error('❌ [performSpatialSearch] Supabase RPC error:', error);
      console.error('❌ [performSpatialSearch] Error message:', error.message);
      console.error('❌ [performSpatialSearch] Error details:', error.details);
      console.error('❌ [performSpatialSearch] Error hint:', error.hint);
      throw new Error(`Spatial search failed: ${error.message}`);
    }

    if (!data) {
      console.warn('⚠️ [performSpatialSearch] No data returned from spatial search');
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

    // Log data shape and structure
    console.log(`✅ [performSpatialSearch] Search found ${data.length} applications`);
    if (data.length > 0) {
      console.log('📊 [performSpatialSearch] First result structure:', JSON.stringify(data[0], null, 2));
      console.log('📊 [performSpatialSearch] First few results:', data.slice(0, 3));
    }

    const applications = data as Application[];
    
    // Log timing information
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`⏱️ [performSpatialSearch] Search completed in ${duration}ms`);
    
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
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ [performSpatialSearch] Failed with error:', error);
    console.error('❌ [performSpatialSearch] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error(`❌ [performSpatialSearch] Search failed after ${duration}ms`);
    
    throw error;
  }
}

export function useSpatialSearch(coordinates: SearchCoordinates | [number, number] | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => {
      console.log('🔍 [useSpatialSearch] Starting query with coordinates:', coordinates);
      
      if (!coordinates) {
        console.error('❌ [useSpatialSearch] No coordinates provided');
        throw new Error('No coordinates provided for spatial search');
      }
      
      return performSpatialSearch(coordinates);
    },
    enabled: !!coordinates,
    retry: false, // Don't retry on failure so we can see errors
    onSuccess: (data) => {
      console.log(`✅ [useSpatialSearch] Query successful, found ${data.applications.length} applications`);
    },
    onError: (error) => {
      console.error('❌ [useSpatialSearch] Query failed with error:', error);
    }
  });
}
