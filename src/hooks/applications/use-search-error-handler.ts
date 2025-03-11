
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
    
    // If we have results, any error is non-critical
    if (hasResultsRef.current) {
      console.log("We have results, suppressing error:", error.message);
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
    
    // Format error message for display
    if (error.message.includes('timeout')) {
      setErrorDetails('The search timed out. Please try a more specific location.');
    } else if (error.message.includes('location') || error.message.includes('coordinates')) {
      setErrorDetails(`We couldn't find this location. Please try a more specific UK location name or postcode.`);
    } else {
      setErrorDetails('We encountered an unexpected error. Please try your search again.');
    }
  }, [isNonCriticalError]);

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
