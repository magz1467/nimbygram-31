
import { Application } from "@/types/planning";
import { withTimeout } from "./fetchUtils";
import { transformApplicationData } from "./transforms/application-transformer";
import { toast } from "@/hooks/use-toast";
import { sortApplicationsByDistance } from "./distance";

/**
 * Fetches applications using the edge function
 */
export const fetchApplicationsFromEdge = async (
  coordinates: [number, number],
  radius: number = 10000 // Increased radius for more comprehensive results
): Promise<Application[] | null> => {
  console.log('🔄 Attempting to fetch applications using edge function');
  console.log('🌍 Search coordinates:', coordinates);
  
  const [lat, lng] = coordinates;
  
  // Get Supabase URL from environment or use a direct URL as fallback
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase URL or key, skipping edge function');
    return null;
  }
  
  console.log('🌐 Using Supabase URL:', supabaseUrl);
  console.log(`🔍 Searching with radius: ${radius}m`);
  
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
          radius_meters: radius,
          page_size: 500 // Increased for better coverage
        })
      }),
      45000, // Extended timeout for larger data fetch
      "Search request timed out. This area may have too many results."
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge function error:', errorText, 'Status:', response.status);
      throw new Error('Edge function failed: ' + (errorText || response.statusText));
    }
    
    const result = await response.json();
    
    if (result.applications && Array.isArray(result.applications)) {
      console.log(`✅ Successfully retrieved ${result.applications.length} applications from edge function`);
      
      // Transform the applications with explicit coordinates
      const transformedApplications = result.applications
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      console.log(`Transformed ${transformedApplications.length} applications, sorting by distance...`);
      
      // Sort by distance using our sortApplicationsByDistance function
      const sortedApps = sortApplicationsByDistance(transformedApplications, coordinates);
      
      // Log the top results for debugging
      console.log(`Top 5 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
      sortedApps.slice(0, 5).forEach((app, idx) => {
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
