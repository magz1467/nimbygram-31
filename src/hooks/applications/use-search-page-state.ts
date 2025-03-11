
import { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SearchState {
  searchType: 'postcode' | 'location';
  searchTerm: string;
  displayTerm?: string;
  timestamp?: number;
}

export const useSearchPageState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchState, setSearchState] = useState<SearchState | null>(location.state as SearchState || null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchComplete, setSearchComplete] = useState(false);
  const hasResultsRef = useRef<boolean>(false);

  // Clear cache and prepare for new search
  const prepareForSearch = useCallback(() => {
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
    
    // Reset refs for the new search
    hasResultsRef.current = false;
    
    // Reset the search complete flag when starting a new search
    setSearchComplete(false);
  }, []);
  
  // Handle search completion
  const handleSearchComplete = useCallback(() => {
    console.log('Search completed successfully');
    setSearchComplete(true);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    hasResultsRef.current = false;
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

  // Handle postcode selection
  const handlePostcodeSelect = useCallback((value: string) => {
    navigate('/search-results', {
      state: {
        searchType: 'postcode',
        searchTerm: value,
        timestamp: Date.now()
      }
    });
  }, [navigate]);

  // Update results status when we receive applications data
  const updateResultsStatus = useCallback((data: any) => {
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`Received ${data.length} results`);
      hasResultsRef.current = true;
    }
  }, []);

  return {
    searchState,
    retryCount,
    searchComplete,
    setSearchComplete,
    hasResultsRef,
    handleSearchComplete,
    handleRetry,
    prepareForSearch,
    handlePostcodeSelect,
    updateResultsStatus
  };
};
