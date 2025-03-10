
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
    // Debug the Supabase connection
    console.log('Supabase client:', supabase ? 'Available' : 'Not available');
    
    // Select all applications without any filtering initially
    // This helps us determine if there's any data in the table at all
    console.log('Fetching all records from crystal_roof table to check data availability');
    const allDataQuery = await supabase
      .from('crystal_roof')
      .select('count');
    
    if (allDataQuery.error) {
      console.error('Error checking data count:', allDataQuery.error);
    } else {
      console.log('Total records in database:', allDataQuery.count);
    }
    
    // Calculate bounds for a radius search
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box:', { latMin, latMax, lngMin, lngMax });
    
    // Select all applications without initial storybook filtering
    const queryResult = await supabase
      .from('crystal_roof')
      .select('*');
    
    let properties = queryResult.data;
    const error = queryResult.error;
    
    console.log('🔍 Query result:', { 
      success: !error, 
      count: properties?.length || 0,
      searchCenter: [lat, lng],
      error: error ? error.message : null
    });
    
    if (error) {
      console.error('Database query error:', error);
      return null;
    }
    
    if (!properties || properties.length === 0) {
      console.log('No data found in the crystal_roof table');
      return [];
    }
    
    // Log a sample row to see what data we're working with
    console.log('Sample row from crystal_roof:', properties[0]);
    
    // Check if any records have storybook values
    const storybookCount = properties.filter(p => p.storybook).length;
    console.log(`Records with storybook values: ${storybookCount} out of ${properties.length}`);
    
    // If none have storybook values, we should report this as a potential issue
    if (storybookCount === 0) {
      console.warn('⚠️ NO RECORDS HAVE STORYBOOK VALUES - this will cause empty search results');
    }
    
    // Filter the results in JavaScript based on approximate distance
    console.log('Raw properties before filtering:', properties.slice(0, 3));
    
    // Filter out null storybook values
    const nonNullStorybooks = properties.filter(property => 
      property.storybook !== null && property.storybook !== undefined && property.storybook !== ''
    );
    
    console.log(`After filtering null storybooks: ${nonNullStorybooks.length} properties remaining`);
    
    // Filter by distance
    properties = nonNullStorybooks.filter(property => {
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
    
    // If we end up with zero results, but had data in the table, we should explain why
    if (properties.length === 0 && nonNullStorybooks.length > 0) {
      console.warn('⚠️ All records were filtered out by distance, consider increasing the radius');
    } else if (properties.length === 0 && nonNullStorybooks.length === 0) {
      console.warn('⚠️ All records were filtered out because none had storybook values');
    }
    
    return properties;
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }
};
