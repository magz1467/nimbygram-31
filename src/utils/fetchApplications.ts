
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
    // First try the RPC function with a Promise timeout instead of the built-in timeout
    try {
      console.log('Attempting to use RPC function');
      const rpcPromise = supabase.rpc(
        'properties_within_distance',
        {
          ref_lat: lat,
          ref_lon: lng,
          radius_meters: radius * 1000 // Convert km to meters
        }
      );
      
      // Create a timeout promise that rejects after 8 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('RPC request timed out')), 8000);
      });
      
      // Race the RPC promise against the timeout
      const { data: rpcData, error: rpcError } = await Promise.race([
        rpcPromise,
        timeoutPromise.then(() => {
          throw new Error('RPC timeout');
        })
      ]) as any;
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`✅ RPC data from supabase: ${rpcData?.length || 0} results`);
        const transformedApplications = rpcData.map(app => 
          transformApplicationData(app, coordinates)
        ).filter((app): app is Application => app !== null);
        
        console.log(`✅ Total transformed applications from RPC: ${transformedApplications.length}`);
        return transformedApplications;
      }
      
      // If RPC fails or returns no data, log and continue to fallback
      console.log('RPC method returned no data or error, falling back to query', rpcError);
    } catch (rpcFetchError) {
      console.log('Error with RPC method, falling back to query:', rpcFetchError);
    }
  
    // Fallback: Query the crystal_roof table directly
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    console.log(`✅ Raw data from supabase: ${data?.length || 0} results`);

    if (!data || data.length === 0) {
      console.log('No applications found in the database');
      return [];
    }

    // Transform the application data using our improved transformer
    const transformedApplications = data.map(app => 
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
