
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SearchResultsPage = () => {
  const location = useLocation();
  const searchState = location.state;

  // Clear any cached data when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('forceRefresh', 'true');
      
      // Clear any cached query data to ensure fresh results
      const cacheKeys = Object.keys(window.sessionStorage).filter(key => 
        key.startsWith('tanstack-query-')
      );
      
      cacheKeys.forEach(key => {
        window.sessionStorage.removeItem(key);
      });
    }
  }, []);

  // Only log if we have valid search state
  if (searchState?.searchTerm) {
    console.log('📍 Processing search:', {
      type: searchState.searchType,
      term: searchState.searchTerm,
      timestamp: searchState.timestamp
    });
  }

  return <SearchView />;
};

export default SearchResultsPage;
