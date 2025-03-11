
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching initial 25 applications closest to coordinates:', coordinates);
  
  try {
    // Try both fetching methods simultaneously to maximize results, but limit to first 25
    console.log('Starting both edge function and direct database queries in parallel for first page...');
    
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
    let combinedResults: Application[] = firstResults ? [...firstResults].slice(0, 25) : [];
    
    console.log(`First source returned ${combinedResults.length} results`);
    
    if (combinedResults.length === 0) {
      console.warn('⚠️ No applications found after combining results');
      toast({
        title: "No Results Found",
        description: "We couldn't find any planning applications in this area. Please try searching for a different location.",
        variant: "destructive",
      });
    }
    
    // Re-sort initial results by distance
    if (combinedResults.length > 0) {
      combinedResults.sort((a, b) => {
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
      
      toast({
        title: "Search Timeout",
        description: "The search took too long to complete. Please try a more specific location.",
        variant: "destructive",
      });
      
      throw timeoutError;
    }
    
    // Show toast for other errors
    toast({
      title: "Search Error",
      description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again or search for a different location.",
      variant: "destructive",
    });
    
    return [];
  }
};
