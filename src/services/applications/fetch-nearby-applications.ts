
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
      
      // Store the original count before filtering
      const originalCount = properties.length;
      
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
            console.log(`⚠️ Property ${property.id} missing coordinates`);
            return false; // Skip if no coordinates
          }
          
          // Log some coordinates to debug
          if (Math.random() < 0.01) { // Log ~1% of properties to avoid console spam
            console.log(`Property ${property.id} coordinates: [${propLat}, ${propLng}]`);
          }
          
          // Check if within extended bounds
          const inBounds = (
            propLat >= latMin && 
            propLat <= latMax && 
            propLng >= lngMin && 
            propLng <= lngMax
          );

          // Double-check with actual distance calculation (more accurate than bounding box)
          if (inBounds) {
            const actualDistance = calculateDistance([lat, lng], [propLat, propLng]);
            return actualDistance <= radius;
          }
          
          return false;
        } catch (err) {
          console.error(`Error filtering property ${property.id}:`, err);
          return false;
        }
      });
      
      console.log(`✅ Filtered from ${originalCount} to ${properties.length} applications within ${radius}km radius`);
      
      // Pre-calculate distances to assist with sorting
      properties = properties.map(property => {
        try {
          // Extract coordinates again (duplicating logic but necessary for distance calculation)
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
          
          // Calculate actual distance
          const distance = calculateDistance([lat, lng], [propLat, propLng]);
          
          // Add distance to the property object for sorting
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
        console.log('Top 3 closest properties:');
        properties.slice(0, 3).forEach((prop, i) => {
          console.log(`[${i}] ID: ${prop.id}, Distance: ${prop.calculatedDistance?.toFixed(2)}km`);
        });
      }
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
