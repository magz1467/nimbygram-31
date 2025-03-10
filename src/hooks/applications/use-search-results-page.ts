
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SearchState {
  searchType: 'postcode' | 'location';
  searchTerm: string;
  displayTerm?: string;
  timestamp?: number;
}

export const useSearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchState, setSearchState] = useState<SearchState | null>(location.state as SearchState || null);
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchComplete, setSearchComplete] = useState(false);

  // Update search state when location.state changes
  useEffect(() => {
    if (location.state) {
      setSearchState(location.state as SearchState);
    }
    
    if (!location.state?.searchTerm) {
      console.warn('No search term provided in state, redirecting to homepage');
      toast({
        title: "Search Error",
        description: "No search term provided. Please try your search again.",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }

    console.log('📍 Processing search:', {
      type: location.state.searchType,
      term: location.state.searchTerm,
      timestamp: location.state.timestamp
    });
    
    // Ensure we don't have stale data in session storage
    if (typeof window !== 'undefined') {
      // Mark that we need to refresh data
      window.sessionStorage.setItem('forceRefresh', 'true');
      
      // Clear any cached query data to ensure fresh results
      const cacheKeys = Object.keys(window.sessionStorage).filter(key => 
        key.startsWith('tanstack-query-')
      );
      
      cacheKeys.forEach(key => {
        window.sessionStorage.removeItem(key);
      });
    }
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Reset the search complete flag when starting a new search
    setSearchComplete(false);
    setIsError(false);
    setErrorDetails(null);
    
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
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location.state, navigate, toast]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setIsError(false);
    setErrorDetails(null);
    setSearchComplete(false);
    
    toast({
      title: "Retrying search",
      description: "Searching again for planning applications...",
    });
    
    // Force refresh by updating the timestamp in the search state
    if (searchState) {
      const updatedState = {
        ...searchState,
        timestamp: Date.now()
      };
      
      // Use replace to avoid adding to history stack
      navigate('/search-results', { 
        state: updatedState,
        replace: true 
      });
      
      // Update local state too
      setSearchState(updatedState);
    }
  }, [searchState, navigate, toast]);

  // Function to handle errors from SearchView
  const handleError = useCallback((error: Error | null) => {
    if (!error) return; // Early return if no error is provided
    
    // Clear any search timeout since we've already detected an error
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
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
  }, []);

  // Handle search completion
  const handleSearchComplete = useCallback(() => {
    console.log('Search completed successfully');
    setSearchComplete(true);
    
    // Clear the timeout when search completes successfully
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  // Prepare initial search state for SearchView
  const handlePostcodeSelect = useCallback((value: string) => {
    navigate('/search-results', {
      state: {
        searchType: 'postcode',
        searchTerm: value,
        timestamp: Date.now()
      }
    });
  }, [navigate]);

  return {
    searchState,
    retryCount,
    isError,
    errorDetails,
    handleRetry,
    handleError,
    handleSearchComplete,
    handlePostcodeSelect
  };
};
