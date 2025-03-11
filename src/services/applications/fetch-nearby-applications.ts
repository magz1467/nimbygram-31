
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Fetches applications near the given coordinates
 * @param coordinates - [latitude, longitude]
 * @param radius - radius in kilometers
 * @returns Applications data from the database, or null if there was an error
 */
export const fetchNearbyApplications = async (
  coordinates: [number, number] | null,
  radius: number = 40
): Promise<any[] | null> => {
  console.log('🔍 Starting to fetch applications near coordinates:', coordinates);
  
  if (!coordinates) {
    console.log('⚠️ No coordinates provided, skipping fetch');
    return null;
  }

  const [lat, lng] = coordinates;
  console.log(`📍 Fetching applications within ${radius}km of [${lat}, ${lng}]`);
  
  try {
    // Calculate bounds for a radius search
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box:', { latMin, latMax, lngMin, lngMax });
    
    // Select all applications within the bounding box
    const queryResult = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', latMin)
      .lte('latitude', latMax)
      .gte('longitude', lngMin)
      .lte('longitude', lngMax)
      .limit(500);
        
    const properties = queryResult.data;
    const error = queryResult.error;
    
    console.log('🔍 Query result:', { 
      success: !error, 
      count: properties?.length || 0,
      searchCenter: [lat, lng]
    });
    
    if (error) {
      console.error('❌ Error fetching application data:', error);
      return null;
    }
    
    if (!properties || properties.length === 0) {
      console.log('⚠️ No properties found in the bounding box');
      
      // Try one more time with a wider search
      const widerRadius = radius * 2;
      console.log(`Trying wider search with ${widerRadius}km radius`);
      
      const widerLatDiff = widerRadius / 111.32;
      const widerLngDiff = widerRadius / (111.32 * Math.cos(lat * Math.PI / 180));
      
      const widerQueryResult = await supabase
        .from('crystal_roof')
        .select('*')
        .gte('latitude', lat - widerLatDiff)
        .lte('latitude', lat + widerLatDiff)
        .gte('longitude', lng - widerLngDiff)
        .lte('longitude', lng + widerLngDiff)
        .limit(500);
      
      if (widerQueryResult.error) {
        console.error('❌ Error in wider search:', widerQueryResult.error);
        return null;
      }
      
      if (widerQueryResult.data && widerQueryResult.data.length > 0) {
        console.log(`✅ Wider search found ${widerQueryResult.data.length} properties`);
        return widerQueryResult.data;
      }
      
      return [];
    }

    console.log(`✨ Received ${properties.length} applications from database`);
    return properties;
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }
};
