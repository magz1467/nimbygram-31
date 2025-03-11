
import { useToast } from "@/hooks/use-toast";

/**
 * Handle search errors with appropriate user feedback
 * @param error The error that occurred
 * @param toast Toast function for displaying messages
 */
export const handleSearchError = (error: any, toast: ReturnType<typeof useToast>['toast']) => {
  console.error('Search error:', error);
  
  // Display a more user-friendly error message for timeouts
  if (isTimeoutError(error)) {
    toast({
      title: "Search Timeout",
      description: "The search is taking too long. Please try a more specific location or different filters.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Search Error",
      description: "There was a problem finding planning applications. Please try again.",
      variant: "destructive",
    });
  }
};

/**
 * Check if an error is a database timeout
 * @param error Error to check
 * @returns Whether this is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return error.code === '57014' || 
         (error.message && error.message.includes('timeout')) ||
         (error.message && error.message.includes('canceling statement'));
};

/**
 * Check if an error is non-critical (e.g., missing tables that can be ignored)
 * @param error Error to check
 * @returns Whether this is a non-critical error
 */
export const isNonCriticalError = (error: any): boolean => {
  if (!error.message) return false;
  
  return error.message.includes('application_support') ||
         error.message.includes('relation') ||
         (error.message.includes('does not exist') && error.message.includes('table'));
};
