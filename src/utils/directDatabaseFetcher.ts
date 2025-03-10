
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { calculateDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches applications directly from the database using pagination
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database with pagination');
  
  const pageSize = 100;
  let currentPage = 0;
  let hasMore = true;
  let allResults: any[] = [];

  while (hasMore) {
    try {
      // Execute the query with proper promise handling
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('*')
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);
        
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      const pageResults = data || [];

      if (pageResults.length === 0) {
        hasMore = false;
      } else {
        allResults = [...allResults, ...pageResults];
        currentPage++;

        // Limit total results to prevent memory issues
        if (allResults.length >= 1000) {
          hasMore = false;
          console.log('Reached maximum result limit of 1000');
        }
      }
    } catch (pageError) {
      console.error('Error fetching page:', pageError);
      // If a page fails, stop paginating but return any results we have so far
      hasMore = false;
      
      // Show a toast only if we have no results at all
      if (allResults.length === 0) {
        toast({
          title: "Search Pagination Error",
          description: "We encountered an issue retrieving all results. Showing partial results.",
          variant: "destructive",
        });
      }
    }
  }
  
  console.log(`✅ Raw data from supabase: ${allResults.length} results`);

  if (allResults.length === 0) {
    console.log('No applications found in the database');
    return [];
  }

  // Transform all application data
  const transformedApplications = allResults
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
  
  // Sort by distance
  return transformedApplications.sort((a, b) => {
    if (!a.coordinates || !b.coordinates) return 0;
    const distanceA = calculateDistance(coordinates, a.coordinates);
    const distanceB = calculateDistance(coordinates, b.coordinates);
    return distanceA - distanceB;
  });
};
