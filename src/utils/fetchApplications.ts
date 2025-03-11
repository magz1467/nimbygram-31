
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications near coordinates:', coordinates);
  
  try {
    // Get distance-filtered results from the database with a reasonable radius
    const maxDistanceKm = 20; // Restrict to 20km radius for more relevant results
    console.log(`Using search radius of ${maxDistanceKm}km to find relevant applications`);
    
    // Try database query first with distance filtering
    let results: Application[] = [];
    
    try {
      results = await fetchApplicationsFromDatabase(coordinates, maxDistanceKm);
      console.log(`Direct database query returned ${results.length} applications within ${maxDistanceKm}km`);
    } catch (err) {
      console.warn('⚠️ Direct database query failed:', err);
      
      // Fallback to edge function
      try {
        const edgeResults = await fetchApplicationsFromEdge(coordinates);
        if (edgeResults) {
          console.log(`Edge function returned ${edgeResults.length} results`);
          
          // Filter by distance
          results = edgeResults.filter(app => {
            if (!app.coordinates) return false;
            const distKm = calculateDistance(coordinates, app.coordinates);
            return distKm <= maxDistanceKm;
          });
          
          console.log(`Filtered to ${results.length} results within ${maxDistanceKm}km`);
        }
      } catch (edgeErr) {
        console.warn('⚠️ Edge function also failed:', edgeErr);
      }
    }
    
    // If we have no results with the initial radius, try gradually increasing it
    if (results.length === 0) {
      console.log('No results found within initial radius, expanding search');
      
      const expandedRadii = [30, 50, 100]; // Try increasingly larger radii
      
      for (const radius of expandedRadii) {
        console.log(`Expanding search radius to ${radius}km`);
        
        try {
          const expandedResults = await fetchApplicationsFromDatabase(coordinates, radius);
          
          if (expandedResults.length > 0) {
            console.log(`Found ${expandedResults.length} results within ${radius}km`);
            results = expandedResults;
            
            // Add a note to the first result
            if (results[0]) {
              results[0].notes = `Showing results up to ${radius}km away because no applications were found closer to your search location.`;
            }
            
            break;
          }
        } catch (err) {
          console.warn(`Failed to get results with expanded radius ${radius}km:`, err);
        }
      }
    }
    
    // If still no results, show appropriate message
    if (results.length === 0) {
      console.warn('⚠️ No applications found even with expanded radius');
      toast({
        title: "No Nearby Results",
        description: "We couldn't find any planning applications near this location. It may be outside our coverage area or have no recent planning activity.",
        variant: "destructive",
      });
    }
    
    return results;
    
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
    
    // Show pagination error toast if that's the specific error
    if (errorStr.includes('pagination') || errorStr.includes('Pagination')) {
      toast({
        title: "Search Pagination Error",
        description: "We encountered an issue retrieving all results. Showing partial results.",
        variant: "destructive",
      });
    } else {
      // Show generic error toast for other errors
      toast({
        title: "Search Error",
        description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again or search for a different location.",
        variant: "destructive",
      });
    }
    
    // Return empty array to avoid crashing the UI
    return [];
  }
};

// Import the distance calculation function for filtering
import { calculateDistance } from "./distance";
