
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications using optimized spatial query
 * @param coordinates Search center coordinates [lat, lng]
 * @param maxDistanceKm Maximum distance in kilometers
 * @returns Array of Application objects
 */
export const fetchApplicationsWithSpatialQuery = async (
  coordinates: [number, number],
  maxDistanceKm: number = 20
): Promise<Application[]> => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.error('❌ Invalid coordinates provided to spatial search', coordinates);
    return [];
  }
  
  const [lat, lng] = coordinates;
  console.log(`🔍 Performing spatial search at [${lat}, ${lng}] with ${maxDistanceKm}km radius`);
  
  try {
    // Call our optimized RPC function
    const { data, error } = await supabase.rpc(
      'get_nearby_applications',
      { 
        center_lat: lat,
        center_lng: lng,
        radius_km: maxDistanceKm 
      }
    );
    
    if (error) {
      console.error('❌ Spatial query error:', error);
      throw new Error(`Spatial query failed: ${error.message}`);
    }
    
    if (!data) {
      console.warn('⚠️ No results returned from spatial query');
      return [];
    }
    
    // Ensure data is an array (defensive check)
    const applications = Array.isArray(data) ? data : [];
    
    console.log(`✅ Spatial query returned ${applications.length} results`);
    
    // Transform raw data to Application objects
    const transformedApplications = applications
      .filter((app) => app != null) // Filter out null entries
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Sort by distance (although the database should already do this)
    const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
    
    console.log(`✅ Returning ${sortedApplications.length} applications`);
    
    return sortedApplications;
  } catch (error) {
    console.error('❌ Error in spatial search:', error);
    toast({
      title: "Search Error",
      description: "We're having trouble searching for planning applications. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};
