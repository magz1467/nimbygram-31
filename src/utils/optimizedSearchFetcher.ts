
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications using optimized spatial query
 * @param coordinates Search center coordinates [lat, lng]
 * @param maxDistanceKm Maximum distance in kilometers
 * @param resultLimit Maximum number of results to return
 * @returns Array of Application objects
 */
export const fetchApplicationsWithSpatialQuery = async (
  coordinates: [number, number],
  maxDistanceKm: number = 20,
  resultLimit: number = 100
): Promise<Application[]> => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.error('❌ Invalid coordinates provided to spatial search', coordinates);
    return [];
  }
  
  const [lat, lng] = coordinates;
  console.log(`🔍 Performing spatial search at [${lat}, ${lng}] with ${maxDistanceKm}km radius, limited to ${resultLimit} results`);
  
  try {
    // First try with RPC function (if it exists)
    try {
      // Call our optimized RPC function
      const { data, error } = await supabase.rpc(
        'get_nearby_applications',
        { 
          center_lat: lat,
          center_lng: lng,
          radius_km: maxDistanceKm,
          result_limit: resultLimit || 100 // Default to 100 if not provided
        }
      );
      
      if (!error && data) {
        // Transform and sort applications
        const applications = Array.isArray(data) ? data : [];
        console.log(`✅ Spatial query returned ${applications.length} results via RPC`);
        
        // Transform raw data to Application objects
        const transformedApplications = applications
          .filter((app) => app != null) // Filter out null entries
          .map(app => transformApplicationData(app, coordinates))
          .filter((app): app is Application => app !== null);
        
        // Sort by distance
        const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
        
        console.log(`✅ Returning ${sortedApplications.length} applications from RPC method`);
        return sortedApplications;
      } else {
        console.log('RPC function not available, falling back to direct query');
        // Fall through to alternative method
      }
    } catch (rpcError) {
      console.log('RPC function error, falling back to direct query:', rpcError);
      // Fall through to alternative method
    }
    
    // Fallback to direct table query with basic filtering
    console.log('Using direct query fallback method');
    
    // Calculate bounds for a radius search (approximate)
    const latDiff = maxDistanceKm / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = maxDistanceKm / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box for direct query:', { latMin, latMax, lngMin, lngMax });
    
    // Direct query to crystal_roof table
    const { data: directData, error: directError } = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', latMin)
      .lte('latitude', latMax)
      .gte('longitude', lngMin)
      .lte('longitude', lngMax)
      .limit(resultLimit);
    
    if (directError) {
      console.error('❌ Direct query error:', directError);
      throw new Error(`Direct query failed: ${directError.message}`);
    }
    
    if (!directData || directData.length === 0) {
      console.warn('⚠️ No results returned from direct query');
      return [];
    }
    
    console.log(`✅ Direct query returned ${directData.length} results`);
    
    // Transform and sort applications
    const transformedApplications = directData
      .filter((app) => app != null) // Filter out null entries
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Sort by distance
    const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
    
    console.log(`✅ Returning ${sortedApplications.length} applications from direct query method`);
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
