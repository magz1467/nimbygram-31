
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchState = location.state;

  // Validate that we have search state
  useEffect(() => {
    if (!searchState?.searchTerm) {
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
      type: searchState.searchType,
      term: searchState.searchTerm,
      timestamp: searchState.timestamp
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
  }, [searchState, navigate, toast]);

  // Only render SearchView if we have valid search state
  if (!searchState?.searchTerm) {
    return null;
  }

  return <SearchView initialSearch={searchState} />;
};

export default SearchResultsPage;
