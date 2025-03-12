
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
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Query the RPC function - get_nearby_applications is a SQL function that uses PostGIS
    let { data, error } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 500 // Request more results to ensure we get enough
    });
    
    // Handle errors from RPC function
    if (error) {
      // Check for specific error that indicates the function doesn't exist
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('Spatial search RPC function not available, falling back to bounding box search');
        return null;
      }
      
      console.error('Spatial search error:', error);
      throw error;
    }
    
    // Handle no results
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
        
        // Classification filter
        if (filters.classification && app.classification && 
            !app.classification.toLowerCase().includes(filters.classification.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }
    
    // Add distance and sort
    const results = data
      .filter((app: any) => {
        // Ensure we have coordinates to calculate distance
        return (typeof app.latitude === 'number' && typeof app.longitude === 'number');
      })
      .map((app: any) => {
        // Calculate distance in kilometers
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        // Convert to miles for display (UK standard)
        const distanceMiles = distanceKm * 0.621371;
        
        // Return application with distance
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)]
        };
      })
      .sort((a: any, b: any) => {
        // Sort by distance
        const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
        const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
        return distA - distB;
      });
    
    console.log(`Returning ${results.length} filtered and sorted results`);
    
    return results;
  } catch (error) {
    console.error('Spatial search error:', error);
    // Return null to indicate fallback should be used
    return null;
  }
}
