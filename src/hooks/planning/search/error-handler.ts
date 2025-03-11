
import { useToast } from "@/hooks/use-toast";

/**
 * Handles search errors by determining error type and displaying appropriate messages
 */
export function handleSearchError(err: any, toast: ReturnType<typeof useToast>["toast"]) {
  console.error('Search error:', err);
  
  // Provide specific error messages for common issues
  const errorMessage = err.message || String(err);
  
  // Don't treat missing support table or functions as real errors
  if (errorMessage.toLowerCase().includes('support table') ||
      errorMessage.toLowerCase().includes('function not available')) {
    console.log('Non-critical error (missing tables/functions):', errorMessage);
    return [];
  }
  
  const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('57014');
  const userMessage = isTimeoutError 
    ? "The search took too long to complete. Please try a more specific location or different filters."
    : "There was a problem finding planning applications. Please try again.";
  
  toast({
    title: "Search Error",
    description: userMessage,
    variant: "destructive",
  });
  
  throw err; // Re-throw to let the error handling in the component deal with it
}
