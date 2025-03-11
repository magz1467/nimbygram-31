
import { useRef, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useSearchTimeout = (
  searchComplete: boolean,
  setSearchComplete: (complete: boolean) => void,
  setIsError: (isError: boolean) => void,
  setErrorDetails: (details: string | null) => void
) => {
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear the search timeout if it exists
  const clearSearchTimeout = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  // Set up a timeout for the search
  const setupSearchTimeout = useCallback(() => {
    // Clear any existing timeout
    clearSearchTimeout();
    
    // Set a global timeout for the search - if it takes more than 2 minutes, consider it failed
    searchTimeoutRef.current = setTimeout(() => {
      if (!searchComplete) {
        console.error('Search timed out after 2 minutes');
        setIsError(true);
        setErrorDetails('The search took too long to complete. Please try searching with a more specific location.');
        
        toast({
          title: "Search Timeout",
          description: "The search took too long. Please try a more specific location.",
          variant: "destructive",
        });
      }
    }, 120000); // 2 minutes
  }, [clearSearchTimeout, searchComplete, setIsError, setErrorDetails, toast]);

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      clearSearchTimeout();
    };
  }, [clearSearchTimeout]);

  return {
    setupSearchTimeout,
    clearSearchTimeout
  };
};
