
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";
import { Application } from "@/types/planning";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  // Calculate bounds for a radius search (approximately 20km)
  const [lat, lng] = coordinates;
  const radius = 20; // km
  const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
  const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - latDiff;
  const latMax = lat + latDiff;
  const lngMin = lng - lngDiff;
  const lngMax = lng + lngDiff;
  
  console.log('🔍 Searching within bounds:', { latMin, latMax, lngMin, lngMax });
  
  try {
    // Query crystal_roof table without relying on geom column
    // Instead, use latitude and longitude columns directly if they exist
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    console.log(`✅ Raw data from supabase: ${data?.length} results`);

    if (!data || data.length === 0) {
      console.log('No applications found in this area');
      return [];
    }

    // Filter the data locally based on the coordinates
    const filteredData = data.filter(app => {
      // Check if the application has coordinates (either in geom or as separate lat/lng fields)
      const appLat = app.latitude || (app.geom?.coordinates ? parseFloat(app.geom.coordinates[1]) : null);
      const appLng = app.longitude || (app.geom?.coordinates ? parseFloat(app.geom.coordinates[0]) : null);
      
      if (appLat === null || appLng === null) return false;
      
      // Check if the coordinates are within our search bounds
      return (
        appLat >= latMin && 
        appLat <= latMax && 
        appLng >= lngMin && 
        appLng <= lngMax
      );
    });
    
    console.log(`✅ Filtered data: ${filteredData?.length} results`);
    
    // Transform the data to ensure correct types and values
    const transformedData = filteredData.map(app => ({
      ...app,
      title: app.description || app.title || `Application ${app.id}`,
      coordinates: (app.latitude && app.longitude) ? 
        [parseFloat(app.latitude), parseFloat(app.longitude)] as [number, number] : 
        (app.geom?.coordinates ? 
          [parseFloat(app.geom.coordinates[1]), parseFloat(app.geom.coordinates[0])] : 
          undefined) as [number, number] | undefined
    }));
    
    console.log(`Found ${transformedData.length} applications within the search radius`);
    
    // Sort by distance from search coordinates
    return transformedData.sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      return distanceA - distanceB;
    });
  } catch (err) {
    console.error('❌ Error in fetchApplications:', err);
    throw err; // Re-throw to allow proper error handling
  }
};
