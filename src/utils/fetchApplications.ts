
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { toast } from "@/hooks/use-toast";

/**
 * Helper function to implement timeout for promises
 */
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]) as Promise<T>;
};

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  try {
    // First, try to fetch from the edge function which has better timeout handling
    try {
      console.log('🔄 Attempting to fetch applications using edge function');
      
      const [lat, lng] = coordinates;
      const radius = 5000; // Changed from 10000 to 5000 meters (5km radius)
      
      // Get Supabase URL from environment or use a direct URL as fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Missing Supabase URL or key, skipping edge function');
        throw new Error('Missing Supabase configuration');
      }
      
      console.log('🌐 Using Supabase URL:', supabaseUrl);
      
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
            page_size: 100
          })
        }),
        30000,
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
        
        // Transform the applications
        const transformedApplications = result.applications
          .map(app => transformApplicationData(app, coordinates))
          .filter((app): app is Application => app !== null);
        
        // Sort by distance
        return transformedApplications.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          const distanceA = calculateDistance(coordinates, a.coordinates);
          const distanceB = calculateDistance(coordinates, b.coordinates);
          return distanceA - distanceB;
        });
      }
      
      console.log('Edge function returned no applications, falling back to direct query');
    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge function failed, falling back to direct query:', edgeFunctionError);
    }
    
    // Fallback to direct query with pagination to prevent timeouts
    console.log('📊 Fetching applications directly from database with pagination');
    
    const [lat, lng] = coordinates;
    const pageSize = 100;
    let currentPage = 0;
    let hasMore = true;
    let allResults: any[] = [];

    while (hasMore) {
      // Use a proper Promise constructor with explicit error handling
      const queryPromise = new Promise<any[]>((resolve, reject) => {
        // Execute the query with proper promise handling
        supabase
          .from('crystal_roof')
          .select('*')
          .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
          .then(result => {
            if (result.error) {
              console.error("Supabase query error:", result.error);
              reject(result.error);
            } else {
              resolve(result.data || []);
            }
          })
          .catch(error => {
            console.error("Unexpected error in Supabase query:", error);
            reject(error);
          });
      });

      try {
        const pageResults = await withTimeout(
          queryPromise,
          20000, // 20 second timeout per page
          "Database query page timed out. Please try again."
        );

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
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    
    // Add specific error handling for timeout errors
    const errorStr = String(err);
    if (errorStr.includes('timeout') || errorStr.includes('57014') || errorStr.includes('statement canceled')) {
      const timeoutError = new Error("Search timed out. The area may have too many results or the database is busy. Try searching for a more specific location.");
      
      // Show toast to the user
      toast({
        title: "Search Timeout",
        description: "The search took too long to complete. Please try a more specific location.",
        variant: "destructive",
      });
      
      throw timeoutError;
    }
    
    // Show generic error toast
    toast({
      title: "Search Error",
      description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again or search for a different location.",
      variant: "destructive",
    });
    
    throw err; // Throw the error to allow proper handling by the caller
  }
};
