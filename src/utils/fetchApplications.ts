
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  try {
    // First, try to fetch from the edge function which has better timeout handling
    try {
      const edgeResults = await fetchApplicationsFromEdge(coordinates);
      
      if (edgeResults && edgeResults.length > 0) {
        return edgeResults;
      }
      
      console.log('Edge function returned no applications, falling back to direct query');
    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge function failed, falling back to direct query:', edgeFunctionError);
    }
    
    // Fallback to direct query with pagination to prevent timeouts
    return await fetchApplicationsFromDatabase(coordinates);
    
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
