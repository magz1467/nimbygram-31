
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    // Call the Supabase RPC function
    const { data, error } = await supabase
      .rpc('get_nearby_applications', { 
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 100
      });
      
    if (error) {
      console.error('Spatial search error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Apply filters
    let results = data;
    
    if (filters.status) {
      results = results.filter(app => 
        app.status?.toLowerCase().includes(filters.status.toLowerCase())
      );
    }
    
    if (filters.type) {
      results = results.filter(app => 
        app.type?.toLowerCase().includes(filters.type.toLowerCase()) ||
        app.application_type_full?.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    
    // Add distance to each result
    return results.map(app => ({
      ...app,
      distance: calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude))
    }));
  } catch (error) {
    console.error('Spatial search failed:', error);
    return null;
  }
}
