
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications directly from the database with pagination to prevent timeouts
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database with pagination');
  console.log('🌍 Search coordinates for distance calculation:', coordinates);
  
  const pageSize = 500; // Smaller batch size to prevent timeouts
  const allApplications: Application[] = [];
  let hasMore = true;
  let page = 0;
  
  try {
    while (hasMore && page < 20) { // Limit to 20 pages maximum to prevent infinite loops
      console.log(`Fetching page ${page} with ${pageSize} records`);
      
      // Execute the Supabase query with pagination
      const result = await supabase
        .from('crystal_roof')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .timeout(15); // 15 second timeout per batch
      
      if (result.error) {
        console.error('❌ Supabase query error on page', page, result.error);
        // Don't throw error, just break the loop to return what we have so far
        break;
      }
      
      const records = result.data || [];
      console.log(`✅ Retrieved ${records.length} records for page ${page}`);
      
      // If we got fewer records than the page size, we've reached the end
      if (records.length < pageSize) {
        hasMore = false;
      }
      
      // Transform the applications with coordinates
      const transformedApps = records
        .map(app => transformApplicationData(app, coordinates))
        .filter((app): app is Application => app !== null);
      
      // Add to our results array
      allApplications.push(...transformedApps);
      
      // Increment page counter
      page++;
      
      // If we have a reasonable number of results already, let's return them
      if (allApplications.length > 1000) {
        console.log(`Have ${allApplications.length} applications, breaking pagination loop early`);
        break;
      }
    }
    
    // Sort all applications by distance
    const sortedApplications = sortApplicationsByDistance(allApplications, coordinates);
    
    console.log(`✅ Total transformed and sorted applications: ${sortedApplications.length}`);
    
    // Log sorted results for debugging
    if (sortedApplications.length > 0) {
      console.log(`Top 10 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
      sortedApplications.slice(0, 10).forEach((app, idx) => {
        if (app.coordinates) {
          const dist = calculateDistance(coordinates, app.coordinates);
          console.log(`${idx+1}. ID: ${app.id}, Distance: ${dist.toFixed(2)}km, Address: ${app.address}`);
        }
      });
    }
    
    return sortedApplications;
  } catch (error) {
    console.error('❌ Error fetching applications with pagination:', error);
    
    // If we have some results already, return them instead of showing an error
    if (allApplications.length > 0) {
      console.log(`Returning ${allApplications.length} applications retrieved before the error`);
      return sortApplicationsByDistance(allApplications, coordinates);
    }
    
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "We're having trouble loading all results. Please try again.",
      variant: "destructive",
    });
    return [];
  }
};
