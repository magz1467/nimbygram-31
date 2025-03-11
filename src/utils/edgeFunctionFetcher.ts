
import { Application } from "@/types/planning";
import { withTimeout } from "./fetchUtils";
import { transformApplicationData } from "./transforms/application-transformer";
import { toast } from "@/hooks/use-toast";
import { sortApplicationsByDistance } from "./distance";

export const fetchApplicationsFromEdge = async (
  coordinates: [number, number],
  page: number = 0,
  pageSize: number = 25
): Promise<Application[] | null> => {
  console.log(`🔄 Fetching page ${page} with ${pageSize} applications using edge function`);
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  
  const [lat, lng] = coordinates;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase URL or key, skipping edge function');
    return null;
  }
  
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
          radius_meters: 100000,
          page_size: pageSize,
          page_number: page
        })
      }),
      30000,
      "Search request timed out. Please try a more specific location."
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge function error:', errorText, 'Status:', response.status);
      throw new Error('Edge function failed: ' + (errorText || response.statusText));
    }
    
    const result = await response.json();
    
    if (result.applications && Array.isArray(result.applications)) {
      console.log(`✅ Retrieved ${result.applications.length} applications for page ${page}`);
      
      // Transform applications with coordinates
      const transformedApplications = result.applications
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      // Sort by distance
      return sortApplicationsByDistance(transformedApplications, coordinates);
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Edge function failed:', error);
    return null;
  }
};
