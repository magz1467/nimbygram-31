
import { Application } from "@/types/planning";
import { withTimeout } from "./fetchUtils";
import { transformApplicationData } from "./transforms/application-transformer";
import { toast } from "@/hooks/use-toast";
import { sortApplicationsByDistance } from "./distance";

/**
 * Fetches applications using the edge function with pagination
 */
export const fetchApplicationsFromEdge = async (
  coordinates: [number, number],
  pageSize = 25,
  page = 0
): Promise<{ applications: Application[]; hasMore: boolean; totalCount: number } | null> => {
  console.log('🔄 Attempting to fetch applications using edge function');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  console.log(`📄 Page ${page}, Page Size: ${pageSize}`);
  
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
          page_size: pageSize,
          page_number: page
        })
      }),
      30000, // 30 second timeout
      "Search request timed out. Please try a more specific location."
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge function error:', errorText, 'Status:', response.status);
      throw new Error('Edge function failed: ' + (errorText || response.statusText));
    }
    
    const result = await response.json();
    
    if (result.applications && Array.isArray(result.applications)) {
      console.log(`✅ Retrieved ${result.applications.length} applications using edge function`);
      
      // Transform applications with coordinates
      const transformedApplications = result.applications
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      // Sort by distance
      const sortedApps = sortApplicationsByDistance(transformedApplications, coordinates);
      
      return {
        applications: sortedApps,
        hasMore: result.hasMore || false,
        totalCount: result.total || sortedApps.length
      };
    }
    
    console.log('Edge function returned no applications, returning null');
    return null;
  } catch (error) {
    console.warn('⚠️ Edge function failed:', error);
    return null;
  }
};
