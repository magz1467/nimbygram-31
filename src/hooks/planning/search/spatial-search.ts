
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications using the get_nearby_applications RPC function
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    console.log('Attempting spatial search with RPC function');
    
    // Query the RPC function
    let query = supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm
    });
    
    // Add other filters if they exist and are not empty
    if (filters?.status && filters.status.trim() !== '') {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters?.type && filters.type.trim() !== '') {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    if (filters?.classification && filters.classification.trim() !== '') {
      query = query.ilike('classification', `%${filters.classification}%`);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      // Check for specific error that indicates the function doesn't exist
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('Spatial search RPC function not available, falling back to bounding box search');
        return null;
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in spatial search');
      return [];
    }
    
    console.log(`Found ${data.length} results in spatial search`);
    
    // Add distance and sort
    return data
      .filter(app => typeof app.latitude === 'number' && typeof app.longitude === 'number')
      .map(app => ({
        ...app,
        distance: `${(calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude)) * 0.621371).toFixed(1)} mi`
      }))
      .sort((a, b) => {
        const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
        const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
        return distA - distB;
      });
  } catch (error) {
    console.error('Spatial search error:', error);
    // Return null to indicate fallback should be used
    return null;
  }
}
