
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/planning/distance-utils";
import { isNonCriticalError } from "@/utils/planning/error-handling";

/**
 * Search for planning applications using PostGIS spatial function
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Search radius in kilometers
 * @returns List of applications with distances
 */
export const searchWithSpatialFunction = async (
  lat: number, 
  lng: number, 
  radiusKm: number = 10
): Promise<Application[] | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_applications', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 500
      });
      
    if (error) {
      console.warn('PostGIS function not available, falling back to basic query:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} planning applications using spatial query`);
      
      // Calculate distances and sort by closest first
      const results = data.map(app => {
        const distance = calculateDistance(
          lat,
          lng,
          Number(app.latitude),
          Number(app.longitude)
        );
        return { ...app, distance };
      }).sort((a, b) => a.distance - b.distance);
      
      return results;
    }
    
    return [];
  } catch (error) {
    console.warn('Error using spatial query, falling back to basic query:', error);
    return null;
  }
};

/**
 * Search for planning applications using basic filtering
 * @param lat Center latitude
 * @param lng Center longitude
 * @param bounds Geographic bounds [minLat, maxLat, minLng, maxLng]
 * @param filters Application filters to apply
 * @returns List of applications with distances
 */
export const searchWithBasicFiltering = async (
  lat: number,
  lng: number,
  bounds: [number, number, number, number],
  filters: { status?: string; type?: string; classification?: string; }
): Promise<Application[]> => {
  try {
    console.log('Using fallback query approach with bounding box');
    
    const [minLat, maxLat, minLng, maxLng] = bounds;
    
    // Query with geographic bounds
    let query = supabase
      .from('crystal_roof')
      .select('*, received') // Explicitly include the received column
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng);
      
    // Apply any filters if present
    if (filters.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    if (filters.type) {
      query = query.or(`type.ilike.%${filters.type}%,application_type_full.ilike.%${filters.type}%`);
    }
    if (filters.classification) {
      query = query.ilike('class_3', `%${filters.classification}%`);
    }
    
    // Directly add the limit to improve performance
    const { data, error } = await query.limit(500);
    
    if (error) {
      console.error('Supabase query error:', error);
      
      // Skip showing UI errors for known non-critical database errors
      if (isNonCriticalError(error)) {
        console.log('Non-critical database error, continuing with empty results');
        return [];
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found for the search criteria');
      return [];
    }
    
    // Calculate distances and sort by closest first
    const results = data.map(app => {
      const distance = calculateDistance(
        lat,
        lng,
        Number(app.latitude),
        Number(app.longitude)
      );
      return { ...app, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    console.log(`Found ${results.length} planning applications`);
    return results;
  } catch (error) {
    console.error('Basic filtering error:', error);
    throw error;
  }
};
