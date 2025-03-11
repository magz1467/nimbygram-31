
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
    // First attempt with a direct RPC call to our optimized function
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
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ No results returned from spatial query');
      return [];
    }
    
    console.log(`✅ Spatial query returned ${data.length} results`);
    
    // Transform raw data to Application objects
    const transformedApplications = data
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Sort by distance
    const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
    
    console.log(`✅ Returning ${sortedApplications.length} applications`);
    
    return sortedApplications;
  } catch (error) {
    console.error('❌ Error in spatial search:', error);
    
    // Fall back to the table query approach if RPC fails
    console.log('Attempting fallback query approach...');
    try {
      // Direct query with manual distance calculation
      const { data: directData, error: directError } = await supabase
        .from('crystal_roof')
        .select('*')
        .limit(500); // Limit to 500 records to prevent timeouts
      
      if (directError) {
        throw directError;
      }
      
      if (!directData || !Array.isArray(directData) || directData.length === 0) {
        console.warn('⚠️ No results from fallback query');
        return [];
      }
      
      console.log(`✅ Fallback query returned ${directData.length} results`);
      
      // Transform and filter by distance
      const transformedApps = directData
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => {
          if (!app || !app.coordinates) return false;
          
          // Calculate distance and filter by maxDistanceKm
          const distKm = calculateDistance(coordinates, app.coordinates);
          return distKm <= maxDistanceKm;
        });
      
      // Sort by distance
      return sortApplicationsByDistance(transformedApps, coordinates);
      
    } catch (fallbackError) {
      console.error('❌ Fallback query also failed:', fallbackError);
      toast({
        title: "Search Error",
        description: "We're having trouble searching for planning applications. Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  }
};

// Helper function to calculate distance for filtering
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
