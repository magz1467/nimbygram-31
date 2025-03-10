
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications directly from the database with pagination to prevent timeouts
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number],
  pageSize = 25,
  page = 0
): Promise<{ applications: Application[]; hasMore: boolean; totalCount: number }> => {
  console.log('📊 Fetching applications directly from database with pagination');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  console.log(`📄 Page ${page}, Page Size: ${pageSize}`);
  
  const allApplications: Application[] = [];
  
  try {
    // First get an approximate count (this is fast)
    const countResult = await supabase
      .from('crystal_roof')
      .select('id', { count: 'exact', head: true });
    
    const totalCount = countResult.count || 0;
    console.log(`📊 Total records count: ${totalCount}`);
    
    // Calculate offset for requested page
    const offset = page * pageSize;
    
    // Execute the query for the specific page
    const result = await supabase
      .from('crystal_roof')
      .select('*')
      .range(offset, offset + pageSize - 1);
    
    if (result.error) {
      console.error('❌ Supabase query error:', result.error);
      throw new Error(`Database query failed: ${result.error.message}`);
    }
    
    const records = result.data || [];
    console.log(`✅ Retrieved ${records.length} records for page ${page}`);
    
    // Transform the applications with coordinates
    const transformedApps = records
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Add to our results array
    allApplications.push(...transformedApps);
    
    // Sort applications by distance
    const sortedApplications = sortApplicationsByDistance(allApplications, coordinates);
    
    console.log(`✅ Total transformed and sorted applications for this page: ${sortedApplications.length}`);
    
    // Determine if there are more records
    const hasMore = offset + records.length < totalCount;
    
    return {
      applications: sortedApplications,
      hasMore,
      totalCount
    };
    
  } catch (error) {
    console.error('❌ Error fetching applications with pagination:', error);
    
    // Show error toast to the user
    toast({
      title: "Database Query Error",
      description: error instanceof Error ? error.message : "We're having trouble loading results. Please try again.",
      variant: "destructive",
    });
    
    return { applications: [], hasMore: false, totalCount: 0 };
  }
};
