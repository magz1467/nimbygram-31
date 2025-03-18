
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { formatDistance, calculateDistance } from "@/utils/distance";
import { SearchFilters } from "../use-planning-search";

// Function to perform a fallback search using bounding box + manual distance calculation
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radius: number,
  filters: SearchFilters
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box for coordinates:', lat, lng);
  
  // Convert radius from km to degrees (approximate)
  // 1 degree of latitude is approximately 111 km
  const radiusDegrees = radius / 111;
  
  try {
    // First, use a bounding box to get a rough set of applications
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gt('latitude', lat - radiusDegrees)
      .lt('latitude', lat + radiusDegrees)
      .gt('longitude', lng - radiusDegrees)
      .lt('longitude', lng + radiusDegrees);
    
    // Apply status filter if present
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    // Apply type filter if present
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in fallback search:', error);
      return []; // Return empty array instead of throwing
    }
    
    console.log(`Fallback search bounding box returned ${data?.length || 0} results`);
    
    // Filter by actual distance and add distance to each application
    const applicationsWithDistance = data
      .map((app: any) => {
        // Skip if missing coordinates
        if (!app.latitude || !app.longitude) return null;
        
        // Calculate actual distance
        const distanceInKm = calculateDistance(
          [lat, lng] as [number, number], 
          [app.latitude, app.longitude] as [number, number]
        );
        const distanceInMiles = distanceInKm * 0.621371; // Convert km to miles
        
        // Log each row's received date field
        console.log(`Application ${app.id} received date:`, app.received);
        
        // Only include if within radius
        if (distanceInKm <= radius) {
          return {
            ...app,
            distance: formatDistance(distanceInMiles),
            distance_km: distanceInKm
          };
        }
        return null;
      })
      .filter(Boolean) // Remove nulls
      .sort((a: any, b: any) => a.distance_km - b.distance_km); // Sort by distance
    
    return applicationsWithDistance as Application[];
  } catch (err) {
    console.error('Error in fallback search:', err);
    return []; // Return empty array instead of throwing
  }
}
