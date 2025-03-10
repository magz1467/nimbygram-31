
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
    const { data: totalCountData, error: countError } = await supabase
      .from('crystal_roof')
      .select('count');
    
    if (countError) {
      console.error('Error checking data count:', countError);
      throw countError;
    }

    console.log('Total records in database:', totalCountData?.[0]?.count);
    
    // Calculate bounds for a radius search
    const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
    const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    
    const latMin = lat - latDiff;
    const latMax = lat + latDiff;
    const lngMin = lng - lngDiff;
    const lngMax = lng + lngDiff;
    
    console.log('Using bounding box:', { latMin, latMax, lngMin, lngMax });
    
    // Query with explicit Promise to handle errors correctly
    const queryResult = await new Promise<{ data: any[] | null, error: any }>((resolve) => {
      supabase
        .from('crystal_roof')
        .select('*')
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          resolve({ data: null, error });
        });
    });
    
    const { data: properties, error } = queryResult;
    
    console.log('🔍 Query result:', { 
      success: !error, 
      count: properties?.length || 0,
      searchCenter: [lat, lng],
      error: error ? error.message : null
    });
    
    if (error) {
      console.error('Database query error:', error);
      throw error;
    }
    
    if (!properties || properties.length === 0) {
      console.log('No data found in the crystal_roof table');
      return [];
    }
    
    // Log details about the first few records
    console.log('Sample rows from crystal_roof:', properties.slice(0, 3));
    
    // Check coordinates in raw data
    const sampleCoords = properties.slice(0, 5).map(p => ({
      id: p.id,
      geom: p.geom,
      geometry: p.geometry,
      latitude: p.latitude,
      longitude: p.longitude
    }));
    console.log('Coordinate samples:', sampleCoords);
    
    // Filter the results in JavaScript based on approximate distance
    const filteredProperties = properties.filter(property => {
      try {
        // Extract coordinates - check both geom and geometry
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
          console.log('No coordinates found for property:', property.id);
          return false;
        }
        
        // Check if coordinates are valid
        if (isNaN(propLat) || isNaN(propLng)) {
          console.log('Invalid coordinates for property:', property.id);
          return false;
        }
        
        // Check if within bounds
        const withinBounds = (
          propLat >= latMin && 
          propLat <= latMax && 
          propLng >= lngMin && 
          propLng <= lngMax
        );

        if (!withinBounds) {
          console.log(`Property ${property.id} outside bounds: [${propLat}, ${propLng}]`);
        }
        
        return withinBounds;
      } catch (err) {
        console.error(`Error filtering property ${property.id}:`, err);
        return false;
      }
    });
    
    console.log(`✅ Filtered to ${filteredProperties.length} applications within radius`);
    
    return filteredProperties;
  } catch (error) {
    console.error('❌ Error fetching application data:', error);
    return null;
  }
};
