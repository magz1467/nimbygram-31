
import { Application } from "@/types/planning";
import { withTimeout } from "./promiseUtils";
import { transformApplicationData } from "./applicationTransforms";
import { calculateDistance } from "./distance";

/**
 * Attempts to fetch applications using the Supabase edge function
 * @param coordinates Search coordinates [lat, lng]
 * @param radius Search radius in kilometers
 * @returns Transformed applications or throws an error if the edge function fails
 */
export const fetchEdgeApplications = async (
  coordinates: [number, number],
  radius: number = 10
): Promise<Application[]> => {
  console.log('🔄 Attempting to fetch applications using edge function');
  
  const [lat, lng] = coordinates;
  
  // Get Supabase URL from environment or use direct reference to the URL constant
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase URL or key, skipping edge function');
    throw new Error('Missing Supabase configuration');
  }
  
  console.log('🌐 Using Supabase URL:', supabaseUrl);
  
  const response = await withTimeout(
    fetch(`${supabaseUrl}/functions/v1/get-applications-with-counts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        center_lat: lat,
        center_lng: lng,
        radius_meters: radius * 1000, // Convert km to meters
        page_size: 100
      })
    }),
    30000, // 30 second timeout
    "Search request timed out. This area may have too many results."
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Edge function error:', errorText, 'Status:', response.status);
    throw new Error('Edge function failed: ' + (errorText || response.statusText));
  }
  
  const result = await response.json();
  
  if (!result.applications || !Array.isArray(result.applications)) {
    console.log('Edge function returned no applications');
    throw new Error('No applications returned from edge function');
  }
  
  console.log(`✅ Successfully retrieved ${result.applications.length} applications from edge function`);
  
  // Transform the applications
  const transformedApplications = result.applications
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  console.log(`Transformed ${transformedApplications.length} applications from edge function`);
  
  // Return all applications sorted by distance
  return sortApplicationsByDistance(transformedApplications, coordinates);
};

/**
 * Sorts applications by distance from the search coordinates
 */
const sortApplicationsByDistance = (applications: Application[], coordinates: [number, number]): Application[] => {
  return applications.sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    return distanceA - distanceB;
  });
};
