
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetches applications near the given coordinates
 * @param coordinates - [latitude, longitude]
 * @param radius - radius in kilometers
 * @returns Applications data from the database, or null if there was an error
 */
export const fetchNearbyApplications = async (
  coordinates: [number, number] | null,
  radius: number = 20
): Promise<any[] | null> => {
  console.log('🔍 Starting to fetch applications near coordinates:', coordinates);
  
  if (!coordinates) {
    console.log('⚠️ No coordinates provided, skipping fetch');
    return null;
  }

  const [lat, lng] = coordinates;
  console.log(`📍 Fetching applications within ${radius}km of [${lat}, ${lng}]`);
  
  // Try using the RPC function first
  let properties;
  let error;
  
  try {
    const rpcResult = await supabase.rpc('properties_within_distance', {
      ref_lat: lat,
      ref_lon: lng,
      radius_meters: radius * 1000 // Convert km to meters
    });
    
    properties = rpcResult.data;
    error = rpcResult.error;
    
    console.log('🔍 RPC query result:', { success: !error, count: properties?.length || 0 });
  } catch (rpcError) {
    console.warn('RPC method failed, falling back to query:', rpcError);
    error = rpcError;
  }
  
  // If RPC fails, use a regular query as fallback
  if (error || !properties || properties.length === 0) {
    console.log('⚠️ Falling back to regular query method');
    
    // Calculate bounds for a radius search (approximately 20km)
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box:', { latMin, latMax, lngMin, lngMax });
    
    const queryResult = await supabase
      .from('crystal_roof')
      .select('*')
      .filter('geom->coordinates->1', 'gte', latMin)
      .filter('geom->coordinates->1', 'lte', latMax)
      .filter('geom->coordinates->0', 'gte', lngMin)
      .filter('geom->coordinates->0', 'lte', lngMax);
        
    properties = queryResult.data;
    error = queryResult.error;
    
    console.log('🔍 Standard query result:', { 
      success: !error, 
      count: properties?.length || 0 
    });
  }

  if (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }

  console.log(`✨ Received ${properties?.length || 0} applications from database`);
  return properties || [];
};
