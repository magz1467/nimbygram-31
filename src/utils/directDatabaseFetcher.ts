
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { calculateDistance } from "./distance";
import { toast } from "@/hooks/use-toast";
import { withTimeout } from "./fetchUtils";

const MAX_RETRY_ATTEMPTS = 2;

/**
 * Fetches applications directly from the database using pagination with retry logic
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database with pagination');
  
  const pageSize = 100;
  let currentPage = 0;
  let hasMore = true;
  let allResults: any[] = [];
  let retryCount = 0;
  let lastError: Error | null = null;

  while (hasMore) {
    try {
      const startIndex = currentPage * pageSize;
      const endIndex = (currentPage + 1) * pageSize - 1;
      
      console.log(`Fetching page ${currentPage} (range: ${startIndex}-${endIndex})`);
      
      // Use withTimeout to prevent long-running queries
      const { data, error } = await withTimeout(
        supabase
          .from('crystal_roof')
          .select('*')
          .range(startIndex, endIndex),
        15000, // 15 second timeout per page
        `Query timeout for page ${currentPage}`
      );
        
      if (error) {
        console.error(`Supabase query error on page ${currentPage}:`, error);
        
        // Handle specific database errors
        if (error.code === '57014' || error.message.includes('statement canceled')) {
          throw new Error(`Database query timeout on page ${currentPage}`);
        }
        
        throw error;
      }
      
      const pageResults = data || [];
      console.log(`Retrieved ${pageResults.length} results from page ${currentPage}`);

      if (pageResults.length === 0) {
        hasMore = false;
        console.log('No more results found, ending pagination');
      } else {
        allResults = [...allResults, ...pageResults];
        currentPage++;
        retryCount = 0; // Reset retry count after successful fetch

        // Limit total results to prevent memory issues
        if (allResults.length >= 1000) {
          hasMore = false;
          console.log('Reached maximum result limit of 1000');
        }
      }
    } catch (pageError: any) {
      console.error(`Error fetching page ${currentPage}:`, pageError);
      
      // Retry logic for transient errors
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        retryCount++;
        console.log(`Retrying page ${currentPage} (attempt ${retryCount} of ${MAX_RETRY_ATTEMPTS})`);
        // Continue the loop without incrementing currentPage to retry the same page
        continue;
      }
      
      // If we've exhausted retries, stop pagination but return any results we have so far
      hasMore = false;
      lastError = pageError;
      
      // Show a toast only if we have no results at all or very few results
      if (allResults.length < pageSize) {
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
    if (lastError) {
      console.error('Failed to fetch any results due to error:', lastError);
      throw lastError;
    }
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
