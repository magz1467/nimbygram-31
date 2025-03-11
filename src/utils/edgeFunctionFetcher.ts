
import { Application } from "@/types/planning";
import { withTimeout } from "./fetchUtils";
import { transformApplicationData } from "./transforms/application-transformer";
import { toast } from "@/hooks/use-toast";
import { sortApplicationsByDistance } from "./distance";

/**
 * Fetches applications using the edge function with pagination
 */
export const fetchApplicationsFromEdge = async (
  coordinates: [number, number]
): Promise<Application[] | null> => {
  console.log('🔄 Attempting to fetch applications using edge function');
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
  
  const pageSize = 1000;
  let allApplications: Application[] = [];
  let currentPage = 0;
  let hasMore = true;
  
  try {
    while (hasMore && currentPage < 10) { // Limit to 10 pages max
      console.log(`Fetching page ${currentPage} with size ${pageSize}`);
      
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
            radius_meters: 100000, // 100km
            page_size: pageSize,
            page_number: currentPage
          })
        }),
        30000, // 30 second timeout per page
        "Search request timed out. Please try a more specific location."
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge function error:', errorText, 'Status:', response.status);
        throw new Error('Edge function failed: ' + (errorText || response.statusText));
      }
      
      const result = await response.json();
      
      if (result.applications && Array.isArray(result.applications)) {
        console.log(`✅ Retrieved ${result.applications.length} applications for page ${currentPage}`);
        
        // Transform applications with coordinates
        const transformedApplications = result.applications
          .map(app => transformApplicationData(app, coordinates))
          .filter((app): app is Application => app !== null);
        
        // Add to our results array
        allApplications.push(...transformedApplications);
        
        // Check if we have more pages
        hasMore = result.hasMore && result.applications.length >= pageSize;
        
        // Move to next page
        currentPage++;
        
        // If we have enough results, break early
        if (allApplications.length > 1000) {
          console.log(`Have ${allApplications.length} applications, breaking pagination loop early`);
          break;
        }
      } else {
        // No applications in this page, break the loop
        hasMore = false;
      }
    }
    
    if (allApplications.length > 0) {
      console.log(`✅ Successfully retrieved ${allApplications.length} total applications from edge function`);
      
      // Sort all applications by distance
      const sortedApps = sortApplicationsByDistance(allApplications, coordinates);
      
      // Log the top results for debugging
      console.log(`Top 10 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
      sortedApps.slice(0, 10).forEach((app, idx) => {
        if (app.coordinates) {
          console.log(`${idx+1}. ID: ${app.id}, Distance: ${app.distance}, Address: ${app.address}`);
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
