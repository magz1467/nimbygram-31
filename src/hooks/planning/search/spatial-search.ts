
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { formatDistance } from "@/utils/formatDistance";
import { SearchFilters } from "../use-planning-search";

// Function to perform a spatial search using PostGIS
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radius: number,
  filters: SearchFilters
): Promise<Application[] | null> {
  console.log('Performing spatial search with PostGIS for coordinates:', lat, lng);
  
  try {
    // Construct filter query
    let query = supabase
      .rpc('get_nearby_applications', { 
        lat, 
        lng, 
        radius_km: radius 
      });
    
    // Apply status filter if present
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    // Apply type filter if present
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    // Execute query
    const { data, error } = await query;
    
    // If error indicates the function doesn't exist, return null for fallback
    if (error && (
      error.message?.includes('function get_nearby_applications() does not exist') ||
      error.message?.includes('relation "get_nearby_applications" does not exist')
    )) {
      console.log('PostGIS RPC function not available, will use fallback');
      return null;
    }
    
    // If there's another error, throw it
    if (error) {
      console.error('Error in spatial search:', error);
      return []; // Return empty array instead of throwing
    }
    
    console.log(`Spatial search returned ${data?.length || 0} results`);
    
    // Add distance to each application
    const applicationsWithDistance = data.map((app: any) => {
      // Format the distance for display
      const distanceInMiles = app.distance_km * 0.621371; // Convert km to miles
      const formattedDistance = formatDistance(distanceInMiles);
      
      // Log each row's received date field
      console.log(`Application ${app.id} received date:`, app.received);
      
      return {
        ...app,
        distance: formattedDistance
      };
    });
    
    return applicationsWithDistance;
  } catch (err) {
    console.error('Error in spatial search:', err);
    throw err;
  }
}
