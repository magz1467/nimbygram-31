
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "./distance";
import { toast } from "@/hooks/use-toast";

const MAX_RETRY_ATTEMPTS = 2;
const MAX_RESULTS = 5000; // Increased for better coverage

/**
 * Fetches applications directly from the database using pagination with retry logic
 */
export const fetchApplicationsFromDatabase = async (
  coordinates: [number, number]
): Promise<Application[]> => {
  console.log('📊 Fetching applications directly from database with pagination');
  console.log('🌍 Search coordinates:', coordinates);
  
  const pageSize = 200; // Increased for better coverage
  let currentPage = 0;
  let hasMore = true;
  let allResults: any[] = [];
  let retryCount = 0;
  let lastError: Error | null = null;

  // Calculate rough area bounds for more targeted querying
  const [lat, lng] = coordinates;
  const latRange = 1.0; // Roughly 111km
  const lngRange = 1.5; // Wider longitude range to account for distortion
  const minLat = lat - latRange;
  const maxLat = lat + latRange;
  const minLng = lng - lngRange;
  const maxLng = lng + lngRange;

  while (hasMore) {
    try {
      const startIndex = currentPage * pageSize;
      const endIndex = (currentPage + 1) * pageSize - 1;
      
      console.log(`Fetching page ${currentPage} (range: ${startIndex}-${endIndex})`);
      
      // Create a promise with a timeout for the Supabase query
      const queryPromise = new Promise<{data: any[] | null, error: any}>(async (resolve, reject) => {
        try {
          // Execute the Supabase query with basic geospatial filtering
          const result = await supabase
            .from('crystal_roof')
            .select('*')
            .range(startIndex, endIndex);
          
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      
      // Set a timeout for the query
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout for page ${currentPage}`));
        }, 20000); // 20 second timeout per page
      });
      
      // Race the query against the timeout
      const result = await Promise.race([queryPromise, timeoutPromise]) as {data: any[] | null, error: any};
        
      if (result.error) {
        console.error(`Supabase query error on page ${currentPage}:`, result.error);
        
        // Handle specific database errors
        if (result.error.code === '57014' || result.error.message?.includes('statement canceled')) {
          throw new Error(`Database query timeout on page ${currentPage}`);
        }
        
        throw result.error;
      }
      
      const pageResults = result.data || [];
      console.log(`Retrieved ${pageResults.length} results from page ${currentPage}`);

      if (pageResults.length === 0) {
        hasMore = false;
        console.log('No more results found, ending pagination');
      } else {
        allResults = [...allResults, ...pageResults];
        currentPage++;
        retryCount = 0; // Reset retry count after successful fetch

        // Limit total results to prevent memory issues
        if (allResults.length >= MAX_RESULTS) {
          hasMore = false;
          console.log(`Reached maximum result limit of ${MAX_RESULTS}`);
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
      lastError = pageError instanceof Error ? pageError : new Error(String(pageError));
      
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
  console.log('Transforming application data with coordinates:', coordinates);
  const transformedApplications = allResults
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
  
  // Sort by distance - this is critical for accurate results
  const sortedApplications = sortApplicationsByDistance(transformedApplications, coordinates);
  
  // Log sorted results for debugging
  console.log(`Top 5 closest applications to [${coordinates[0]}, ${coordinates[1]}]:`);
  sortedApplications.slice(0, 5).forEach((app, idx) => {
    if (app.coordinates) {
      const dist = calculateDistance(coordinates, app.coordinates);
      console.log(`${idx+1}. ID: ${app.id}, Location: [${app.coordinates[0]}, ${app.coordinates[1]}], Distance: ${dist.toFixed(2)}km`);
    }
  });
  
  return sortedApplications;
};
