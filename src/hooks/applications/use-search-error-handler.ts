
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useSearchErrorHandler = (
  hasResultsRef: React.MutableRefObject<boolean>
) => {
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();

  // Handler for filtering non-critical errors
  const isNonCriticalError = useCallback((error: Error | null): boolean => {
    if (!error) return true;
    
    const errorMsg = error.message.toLowerCase();
    
    // Filter out specific database errors that don't affect core functionality
    if (errorMsg.includes("application_support") || 
        errorMsg.includes("relation") ||
        errorMsg.includes("does not exist")) {
      console.log("Filtering non-critical error:", error.message);
      return true;
    }
    
    // If we have results, consider any error non-critical
    if (hasResultsRef.current) {
      console.log("We have results, so considering error non-critical:", error.message);
      return true;
    }
    
    return false;
  }, [hasResultsRef]);

  // Function to handle errors from SearchView
  const handleError = useCallback((error: Error | null) => {
    if (!error) {
      setIsError(false);
      setErrorDetails(null);
      return;
    }
    
    // Skip non-critical errors
    if (isNonCriticalError(error)) {
      console.log("Ignoring non-critical error:", error?.message);
      setIsError(false);
      setErrorDetails(null);
      return;
    }
    
    console.error('Search error detected:', error);
    setIsError(true);
    
    // Format the error for display, handling various error types
    let formattedErrorMessage: string;
    
    if (error instanceof Error) {
      formattedErrorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle when error is an object (but not Error instance)
      formattedErrorMessage = String(error);
      
      // Try to extract message if it exists
      if ('message' in error) {
        formattedErrorMessage = String((error as any).message);
      }
    } else {
      formattedErrorMessage = String(error);
    }
    
    // Extract more detailed error message if available
    const errorMessage = formattedErrorMessage || '';
    if (errorMessage.includes('timeout') || errorMessage.includes('57014') || errorMessage.includes('statement canceled')) {
      setErrorDetails('The search timed out. This area may have too many results or the database is busy. Try a more specific location.');
    } else if (errorMessage.includes('location') || errorMessage.includes('coordinates') || errorMessage.includes('find')) {
      setErrorDetails(`We couldn't find this location. Please try a more specific UK location name or postcode.`);
    } else {
      setErrorDetails(formattedErrorMessage || 'We encountered an unexpected error. Please try your search again.');
    }
  }, [isNonCriticalError]);

  // Reset error state
  const resetErrors = useCallback(() => {
    setIsError(false);
    setErrorDetails(null);
  }, []);

  return {
    isError,
    errorDetails,
    handleError,
    resetErrors,
    isNonCriticalError
  };
};
