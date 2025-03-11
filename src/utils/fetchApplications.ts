import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching ALL applications to find closest ones to coordinates:', coordinates);
  
  try {
    // Try both fetching methods simultaneously to maximize results
    console.log('Starting both edge function and direct database queries in parallel to get ALL records...');
    
    // Use Promise.race to get results from whichever source responds first
    const firstResultsPromise = Promise.race([
      fetchApplicationsFromEdge(coordinates).catch(err => {
        console.warn('⚠️ Edge function failed:', err);
        return null;
      }),
      fetchApplicationsFromDatabase(coordinates).catch(err => {
        console.warn('⚠️ Direct database query failed:', err);
        return [];
      })
    ]);
    
    // Wait for the first results to come in
    const firstResults = await firstResultsPromise;
    let combinedResults: Application[] = firstResults ? [...firstResults] : [];
    
    console.log(`First source returned ${combinedResults.length} results`);
    
    // If we got results from one source, try to get more from the other source in the background
    if (combinedResults.length > 0) {
      // Return the first results immediately to improve perceived performance
      setTimeout(async () => {
        try {
          // Try the other method in the background using Promise.race instead of Promise.any
          const secondResults = await Promise.race([
            fetchApplicationsFromEdge(coordinates).catch(() => null),
            fetchApplicationsFromDatabase(coordinates).catch(() => [])
          ]);
          
          if (secondResults && secondResults.length > 0) {
            console.log(`Background fetch found ${secondResults.length} additional results`);
          }
        } catch (err) {
          console.warn('Background fetch failed:', err);
        }
      }, 0);
      
      if (combinedResults.length === 0) {
        console.warn('⚠️ No applications found after combining results');
        toast({
          title: "No Results Found",
          description: "We couldn't find any planning applications in this area. Please try searching for a different location.",
          variant: "destructive",
        });
      }
      
      return combinedResults;
    }
    
    // If first attempt didn't return results, wait for both methods to complete
    const [edgeResults, dbResults] = await Promise.all([
      fetchApplicationsFromEdge(coordinates).catch(err => {
        console.warn('⚠️ Edge function failed:', err);
        return null;
      }),
      fetchApplicationsFromDatabase(coordinates).catch(err => {
        console.warn('⚠️ Direct database query failed:', err);
        return [];
      })
    ]);
    
    console.log(`Edge function returned ${edgeResults?.length || 0} results`);
    console.log(`Direct database query returned ${dbResults.length} results`);
    
    // Combine results from both sources, ensuring we eliminate duplicates
    combinedResults = [];
    
    // Start with edge results if we have them
    if (edgeResults && edgeResults.length > 0) {
      combinedResults = [...edgeResults];
      console.log(`Added ${edgeResults.length} applications from edge function`);
    }
    
    // Add unique results from the direct database query
    if (dbResults.length > 0) {
      // Create a Set of IDs from the combined results so far
      const existingIds = new Set(combinedResults.map(app => app.id));
      
      // Add only unique applications from dbResults
      const uniqueDbResults = dbResults.filter(app => !existingIds.has(app.id));
      console.log(`Found ${uniqueDbResults.length} unique applications from direct query`);
      
      // Add the unique results to our combined results
      combinedResults = [...combinedResults, ...uniqueDbResults];
    }
    
    console.log(`Total combined results: ${combinedResults.length}`);
    
    // If we have no results at all, show an error
    if (combinedResults.length === 0) {
      console.warn('⚠️ No applications found after combining results');
      toast({
        title: "No Results Found",
        description: "We couldn't find any planning applications in this area. Please try searching for a different location.",
        variant: "destructive",
      });
    } else {
      // Re-sort ALL combined results by distance to ensure the closest applications are first
      combinedResults.sort((a, b) => {
        // Parse distance values to numbers for comparison
        const distA = typeof a.distance === 'string' ? 
                      parseFloat(a.distance?.split(' ')[0]) || Number.MAX_SAFE_INTEGER : 
                      Number.MAX_SAFE_INTEGER;
        const distB = typeof b.distance === 'string' ? 
                      parseFloat(b.distance?.split(' ')[0]) || Number.MAX_SAFE_INTEGER : 
                      Number.MAX_SAFE_INTEGER;
        return distA - distB;
      });
    }
    
    return combinedResults;
    
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
