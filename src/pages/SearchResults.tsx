
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<Error | null>(null);
  const firstRenderRef = useRef(true);
  const handleErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPath = useRef<string | null>(null);

  // Get search parameters from URL
  const searchTerm = searchParams.get('search') || location.state?.searchTerm;
  const searchType = (searchParams.get('searchType') || location.state?.searchType || 'location') as 'postcode' | 'location';
  const timestamp = searchParams.get('timestamp') ? parseInt(searchParams.get('timestamp')!) : Date.now();
  
  // Construct a search state object from URL parameters
  const searchState = searchTerm ? {
    searchType,
    searchTerm,
    displayTerm: searchTerm,
    timestamp
  } : location.state;

  // Log route changes
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      if (previousPath.current) {
        logRouteChange(previousPath.current, location.pathname, 'internal');
      }
      previousPath.current = location.pathname;
    }
    
    return () => {
      // Clear any pending timeouts when component unmounts
      if (handleErrorTimeoutRef.current) {
        clearTimeout(handleErrorTimeoutRef.current);
      }
    };
  }, [location]);

  // Use useCallback to create stable function references
  const handleError = useCallback((err: Error | null) => {
    if (err) {
      console.log('Search error detected:', err.message);
      
      // Prevent setting state during render cycle
      if (handleErrorTimeoutRef.current) {
        clearTimeout(handleErrorTimeoutRef.current);
      }
      
      handleErrorTimeoutRef.current = setTimeout(() => {
        setError(err);
        handleErrorTimeoutRef.current = null;
      }, 0);
    }
  }, []);

  const handleSearchComplete = useCallback(() => {
    console.log('Search complete');
  }, []);

  const handleRetry = useCallback(() => {
    // Reset the error state and force a re-render
    setError(null);
  }, []);

  // If we don't have search state, show the no search state view
  if (!searchState?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={(postcode) => {
      // Use URL parameters instead of location state
      navigate(`/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`);
    }} />;
  }

  if (error) {
    return <SearchErrorView 
      errorDetails={error.message} 
      onRetry={handleRetry} 
    />;
  }

  return (
    <SearchView 
      initialSearch={searchState}
      onError={handleError}
      onSearchComplete={handleSearchComplete}
    />
  );
};

export default SearchResultsPage;
