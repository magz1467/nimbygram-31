
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { useSearchLogger } from "@/hooks/use-search-logger";
import { type PostgrestResponse } from '@supabase/supabase-js';
import { calculateDistance, kmToMiles } from "../utils/distance-calculator";
import { calculateBoundingBox } from "../utils/bounding-box";

/**
 * Hook for performing bounding box searches for planning applications
 */
export const useBoundingBoxSearch = () => {
  const { logSearch, logSearchError } = useSearchLogger();

  const searchByBoundingBox = async (lat: number, lng: number, radius: number, limit = 25) => {
    try {
      // Calculate bounding box coordinates
      const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(lat, lng, radius);

      // Log search parameters
      console.log(`Performing fallback search with bounding box: ${minLat},${minLng} to ${maxLat},${maxLng}`);
      
      // Build and execute query
      const query = supabase
        .from('crystal_roof')
        .select(`
          id, latitude, longitude, description, status, 
          address, size, category, created_at, updated_at,
          authority_name, impact_score, title, ref_number, image_url,
          location_image, storybook
        `)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      // Add timeout to query execution
      const response = await withTimeout<PostgrestResponse<any>>(
        query,
        20000,
        'Fallback search timeout'
      );
      
      if (response && 'data' in response && 'error' in response) {
        const { data, error } = response;
        
        if (error) {
          console.error('Error in fallback search:', error);
          logSearchError('bounding-box', 'database_error', JSON.stringify(error));
          return { data: [], error };
        }

        // Process and return results with distance calculations
        if (data && Array.isArray(data)) {
          const resultsWithDistance = data.map(app => {
            const appLat = parseFloat(app.latitude);
            const appLng = parseFloat(app.longitude);
            
            // Calculate distance in kilometers
            const distance = calculateDistance(lat, lng, appLat, appLng);
            
            return {
              ...app,
              distance,
              distance_miles: kmToMiles(distance)
            };
          });
          
          // Sort by distance
          resultsWithDistance.sort((a, b) => a.distance - b.distance);
          
          return { data: resultsWithDistance, error: null };
        }
      }
      
      return { data: [], error: new Error('Invalid response format from database') };
    } catch (error) {
      console.error('Error in fallback search:', error);
      logSearchError('bounding-box', 'exception', error instanceof Error ? error.message : String(error));
      return { data: [], error };
    }
  };

  return { searchByBoundingBox };
};
