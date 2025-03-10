
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { calculateDistance } from "@/utils/distance";

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
    
    // Select all applications
    const queryResult = await supabase
      .from('crystal_roof')
      .select('*');
        
    let properties = queryResult.data;
    const error = queryResult.error;
    
    console.log('🔍 Query result:', { 
      success: !error, 
      count: properties?.length || 0,
      searchCenter: [lat, lng]
    });
    
    // Filter the results in JavaScript based on approximate distance
    if (properties && properties.length > 0) {
      // Store the original count before filtering
      const originalCount = properties.length;
      console.log('Raw properties before filtering:', properties.slice(0, 3));
      
      // Filter applications by distance
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
          
          // Check if coordinates are valid numbers
          if (isNaN(propLat) || isNaN(propLng)) {
            return false;
          }
          
          // Calculate actual distance
          const distance = calculateDistance([lat, lng], [propLat, propLng]);
          
          // Only include applications within the specified radius
          return distance <= radius;
        } catch (err) {
          console.error(`Error filtering property ${property.id}:`, err);
          return false;
        }
      });
      
      console.log(`✅ Filtered from ${originalCount} to ${properties.length} applications within ${radius}km radius`);
      
      // Calculate and add distance for each property
      properties = properties.map(property => {
        try {
          // Extract coordinates again for distance calculation
          let propLat, propLng;
          
          if (property.geom?.coordinates) {
            propLng = parseFloat(property.geom.coordinates[0]);
            propLat = parseFloat(property.geom.coordinates[1]);
          } else if (property.geometry?.coordinates) {
            propLng = parseFloat(property.geometry.coordinates[0]);
            propLat = parseFloat(property.geometry.coordinates[1]);
          } else if (property.latitude && property.longitude) {
            propLat = parseFloat(property.latitude);
            propLng = parseFloat(property.longitude);
          } else {
            return property; // Skip distance calculation if no coordinates
          }
          
          // Calculate distance
          const distance = calculateDistance([lat, lng], [propLat, propLng]);
          
          // Add distance to the property object
          return {
            ...property,
            calculatedDistance: distance
          };
        } catch (err) {
          console.error(`Error calculating distance for property ${property.id}:`, err);
          return property;
        }
      });
      
      // Sort by distance
      properties.sort((a, b) => {
        const distA = a.calculatedDistance !== undefined ? a.calculatedDistance : Number.MAX_VALUE;
        const distB = b.calculatedDistance !== undefined ? b.calculatedDistance : Number.MAX_VALUE;
        return distA - distB;
      });
      
      // Log the closest properties to verify sorting
      if (properties.length > 0) {
        console.log('Top 5 closest properties:');
        properties.slice(0, 5).forEach((prop, i) => {
          console.log(`[${i}] ID: ${prop.id}, Distance: ${prop.calculatedDistance?.toFixed(2)}km`);
        });
      }
    }
    
    if (error) {
      console.error('❌ Error fetching application data:', error);
      return null;
    }

    console.log(`✨ Returning ${properties?.length || 0} applications sorted by distance`);
    return properties || [];
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }
};
