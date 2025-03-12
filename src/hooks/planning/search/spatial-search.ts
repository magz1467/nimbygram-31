
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications
 * Since the RPC function might not exist, this function will return null if the function is not available
 * which will trigger the fallback search method
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    console.log('Attempting spatial search with RPC function');
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Check if the RPC function exists by trying to call it
    let { data, error } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 500
    });
    
    // If the function doesn't exist, return null to trigger fallback
    if (error) {
      if (error.message.includes('Could not find the function') || 
          error.message.includes('does not exist')) {
        console.log('Spatial search RPC function not available, will use fallback search');
        return null;
      }
      
      console.error('Spatial search error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in spatial search');
      return [];
    }
    
    console.log(`Found ${data.length} results in spatial search`);
    
    // Apply additional filters if needed
    if (filters) {
      data = data.filter((app: any) => {
        // Status filter
        if (filters.status && app.status && 
            !app.status.toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
        
        // Type filter
        if (filters.type && app.type && 
            !app.type.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }
    
    // Add distance and sort
    const results = data
      .filter((app: any) => {
        return (typeof app.latitude === 'number' && typeof app.longitude === 'number');
      })
      .map((app: any) => {
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        const distanceMiles = distanceKm * 0.621371;
        
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)]
        };
      })
      .sort((a: any, b: any) => {
        const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
        const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
        return distA - distB;
      });
    
    console.log(`Returning ${results.length} filtered and sorted results`);
    return results;
  } catch (error) {
    console.error('Spatial search error:', error);
    return null; // Return null to indicate fallback should be used
  }
}
