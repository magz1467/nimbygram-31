
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
  radius: number = 10
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
    // Calculate bounds for a radius search
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box:', { latMin, latMax, lngMin, lngMax });
    
    // Select all applications
    const queryResult = await supabase
      .from('crystal_roof')
      .select('*');
        
    properties = queryResult.data;
    error = queryResult.error;
    
    console.log('🔍 Query result:', { 
      success: !error, 
      count: properties?.length || 0,
      searchCenter: [lat, lng]
    });
    
    // Filter the results in JavaScript based on approximate distance
    if (properties && properties.length > 0) {
      console.log('Raw properties before filtering:', properties.slice(0, 3));
      
      properties = properties.filter(property => {
        try {
          // Extract coordinates - check both geom and geometry
          let propLat, propLng;
          
          if (property.geom?.coordinates) {
            // CRITICAL: Check coordinate order in geom - ensure [lng, lat] is converted to [lat, lng]
            propLng = parseFloat(property.geom.coordinates[0]);
            propLat = parseFloat(property.geom.coordinates[1]);
          } else if (property.geometry?.coordinates) {
            propLng = parseFloat(property.geometry.coordinates[0]);
            propLat = parseFloat(property.geometry.coordinates[1]);
          } else if (property.latitude && property.longitude) {
            // Use direct lat/lng properties if available
            propLat = parseFloat(property.latitude);
            propLng = parseFloat(property.longitude);
          } else {
            return false; // Skip if no coordinates
          }
          
          // Check if within extended bounds
          return (
            propLat >= latMin && 
            propLat <= latMax && 
            propLng >= lngMin && 
            propLng <= lngMax
          );
        } catch (err) {
          console.error(`Error filtering property ${property.id}:`, err);
          return false;
        }
      });
      
      console.log(`✅ Filtered to ${properties.length} applications within radius`);
    }
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }

  if (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }

  console.log(`✨ Received ${properties?.length || 0} applications from database`);
  return properties || [];
};
