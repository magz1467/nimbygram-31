
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { toast } from "@/hooks/use-toast";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  // Use a smaller radius to reduce query complexity and timeout risk
  const [lat, lng] = coordinates;
  const radius = 15; // km - reduced from 35km to 15km to avoid timeout
  const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
  const lngDiff = radius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - latDiff;
  const latMax = lat + latDiff;
  const lngMin = lng - lngDiff;
  const lngMax = lng + lngDiff;
  
  console.log('🔍 Searching within bounds:', { latMin, latMax, lngMin, lngMax });

  try {
    // Add a timeout to the query
    const timeoutPromise = new Promise<any[]>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });
    
    // Create the actual query promise
    const queryPromise = supabase
      .from('crystal_roof')
      .select('*')
      .limit(50) // Limit the number of results to avoid processing too much data
      .abortSignal(new AbortController().signal) // Fix: Pass an abort signal

    // Race the promises
    const data = await Promise.race([
      queryPromise.then(res => {
        if (res.error) throw res.error;
        return res.data || [];
      }),
      timeoutPromise
    ]);

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
    
    // Show toast to the user
    toast({
      title: "Search Error",
      description: "We're having trouble loading the results. Please try again or search for a different location.",
      variant: "destructive",
    });
    
    // Return empty array instead of throwing
    console.log('Returning empty array due to error');
    return [];
  }
};
