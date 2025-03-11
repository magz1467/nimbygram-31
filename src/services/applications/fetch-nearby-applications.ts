
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
  
  let properties;
  let error;
  
  try {
    // Calculate bounds for a radius search - approximately convert km to degrees
    // This is an approximation that works reasonably well for small distances
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box for initial filtering:', { latMin, latMax, lngMin, lngMax });
    
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
    
    // Filter the results based on coordinates and distance
    if (properties && properties.length > 0) {
      console.log(`Raw properties count before filtering: ${properties.length}`);
      
      // Function to calculate distance between two points (haversine formula)
      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                 Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      // Filter properties by distance
      properties = properties.filter(property => {
        try {
          // Extract coordinates - check both geom and geometry fields
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
          
          // Calculate actual distance
          const distance = calculateDistance(lat, lng, propLat, propLng);
          
          // Add distance to property for sorting later
          property.distanceKm = distance;
          
          // Only include properties within the radius
          return distance <= radius;
          
        } catch (err) {
          console.error(`Error filtering property ${property.id}:`, err);
          return false;
        }
      });
      
      // Sort properties by distance
      properties.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
      
      console.log(`✅ Filtered to ${properties.length} applications within ${radius}km radius`);
      
      // Log some examples
      if (properties.length > 0) {
        console.log("Sample applications with distances:");
        properties.slice(0, 5).forEach(p => {
          console.log(`ID: ${p.id}, Distance: ${p.distanceKm?.toFixed(2)}km, Address: ${p.address || 'unknown'}`);
        });
      } else {
        console.log(`⚠️ No applications found within ${radius}km of [${lat}, ${lng}]`);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }

  if (error) {
    console.error('❌ Error from database query:', error);
    return null;
  }

  console.log(`✨ Returning ${properties?.length || 0} applications within ${radius}km`);
  return properties || [];
};
