
import { toast } from "@/hooks/use-toast";

/**
 * Handles application fetch errors and shows appropriate toast messages
 * @param err The error that occurred
 * @returns The error, rethrown for further handling
 */
export const handleApplicationFetchError = (err: any): never => {
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
};
