
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  // Set a more generous radius to find more results (35km instead of 30km)
  const [lat, lng] = coordinates;
  const radius = 35; // km - increased from 30km
  const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
  const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - latDiff;
  const latMax = lat + latDiff;
  const lngMin = lng - lngDiff;
  const lngMax = lng + lngDiff;
  
  console.log('🔍 Searching within bounds:', { latMin, latMax, lngMin, lngMax });

  try {
    // Skip RPC method and go straight to the direct query which seems more reliable
    console.log('Using direct query method for better reliability');
    
    // Query the crystal_roof table directly
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*');

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    console.log(`✅ Raw data from supabase: ${data?.length || 0} results`);

    if (!data || data.length === 0) {
      console.log('No applications found in the database');
      return [];
    }

    // Filter for applications within our radius after we get all data
    const filteredData = data.filter(app => {
      try {
        // Extract coordinates from the application
        let appLat, appLng;
        
        if (app.geom?.coordinates) {
          appLng = parseFloat(app.geom.coordinates[0]);
          appLat = parseFloat(app.geom.coordinates[1]);
        } else if (app.geometry?.coordinates) {
          appLng = parseFloat(app.geometry.coordinates[0]);
          appLat = parseFloat(app.geometry.coordinates[1]);
        } else {
          return false; // Skip if no coordinates
        }
        
        // Check if within bounds
        return (
          appLat >= latMin && 
          appLat <= latMax && 
          appLng >= lngMin && 
          appLng <= lngMax
        );
      } catch (err) {
        console.log(`Error filtering application ${app.id}:`, err);
        return false;
      }
    });
    
    console.log(`✅ Filtered to ${filteredData.length} applications within radius`);

    // Transform the application data using our improved transformer
    const transformedApplications = filteredData.map(app => 
      transformApplicationData(app, coordinates)
    ).filter((app): app is Application => app !== null);
    
    console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
    
    // Sort by distance
    return transformedApplications.sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      return distanceA - distanceB;
    });
  } catch (err) {
    console.error('❌ Error in fetchApplications:', err);
    // Return empty array instead of throwing
    console.log('Returning empty array due to error');
    return [];
  }
};
