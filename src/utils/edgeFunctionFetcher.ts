
import { Application } from "@/types/planning";
import { withTimeout } from "./fetchUtils";
import { transformApplicationData } from "./transforms/application-transformer";
import { toast } from "@/hooks/use-toast";
import { sortApplicationsByDistance } from "./distance";

/**
 * Fetches ALL applications using the edge function without geographic filtering
 */
export const fetchApplicationsFromEdge = async (
  coordinates: [number, number]
): Promise<Application[] | null> => {
  console.log('🔄 Attempting to fetch ALL applications using edge function');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  
  const [lat, lng] = coordinates;
  
  // Get Supabase URL from environment or use a direct URL as fallback
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase URL or key, skipping edge function');
    return null;
  }
  
  console.log('🌐 Using Supabase URL:', supabaseUrl);
  
  try {
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
          radius_meters: 1000000, // Effectively unlimited radius
          page_size: 100000, // Retrieve as many records as possible
          no_filtering: true // New flag to indicate no geographic filtering
        })
      }),
      120000, // Extended timeout for larger data fetch (2 minutes)
      "Search request timed out. Too many results to process."
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge function error:', errorText, 'Status:', response.status);
      throw new Error('Edge function failed: ' + (errorText || response.statusText));
    }
    
    const result = await response.json();
    
    if (result.applications && Array.isArray(result.applications)) {
      console.log(`✅ Successfully retrieved ${result.applications.length} applications from edge function`);
      
      // Transform ALL applications with coordinates
      const transformedApplications = result.applications
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      console.log(`Transformed ${transformedApplications.length} applications, sorting by distance...`);
      
      // Sort ALL applications by distance
      const sortedApps = sortApplicationsByDistance(transformedApplications, coordinates);
      
      // Log the top results for debugging
      console.log(`Top 10 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
      sortedApps.slice(0, 10).forEach((app, idx) => {
        if (app.coordinates) {
          console.log(`${idx+1}. ID: ${app.id}, Location: [${app.coordinates[0]}, ${app.coordinates[1]}], Distance: ${app.distance}`);
        }
      });
      
      return sortedApps;
    }
    
    console.log('Edge function returned no applications, returning null');
    return null;
  } catch (error) {
    console.warn('⚠️ Edge function failed:', error);
    return null;
  }
};
