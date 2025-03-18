
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<Error | null>(null);
  const firstRenderRef = useRef(true);
  const handleErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPath = useRef<string | null>(null);
  const env = getEnvironmentName();
  const hostname = getCurrentHostname();

  console.log(`[SearchResultsPage][${env}][${hostname}] 🔄 Initializing with URL: ${location.pathname}${location.search}`);
  console.log(`[SearchResultsPage][${env}] 📋 Search params:`, Object.fromEntries(searchParams.entries()));
  console.log(`[SearchResultsPage][${env}] 📋 Location state:`, location.state);

  // Get search parameters from URL
  const searchTerm = searchParams.get('search') || location.state?.searchTerm;
  const searchType = (searchParams.get('searchType') || location.state?.searchType || 'location') as 'postcode' | 'location';
  const timestamp = searchParams.get('timestamp') ? parseInt(searchParams.get('timestamp')!) : Date.now();
  
  console.log(`[SearchResultsPage][${env}] 📋 Extracted search params: term="${searchTerm}", type=${searchType}, timestamp=${timestamp}`);
  
  // Construct a search state object from URL parameters
  const searchState = searchTerm ? {
    searchType,
    searchTerm,
    displayTerm: searchTerm,
    timestamp
  } : location.state;

  console.log(`[SearchResultsPage][${env}] 📋 Constructed searchState:`, searchState);

  // Log route changes
  useEffect(() => {
    console.log(`[SearchResultsPage][${env}] 🔄 useEffect for route change triggered`);
    
    if (previousPath.current !== location.pathname) {
      console.log(`[SearchResultsPage][${env}] 🔄 Path changed from ${previousPath.current} to ${location.pathname}`);
      
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
  }, [location, env]);

  // Use useCallback to create stable function references
  const handleError = useCallback((err: Error | null) => {
    console.log(`[SearchResultsPage][${env}] handleError called with:`, err?.message);
    
    if (err) {
      console.log(`[SearchResultsPage][${env}] 🔴 Search error detected:`, err.message);
      
      // Prevent setting state during render cycle
      if (handleErrorTimeoutRef.current) {
        clearTimeout(handleErrorTimeoutRef.current);
      }
      
      handleErrorTimeoutRef.current = setTimeout(() => {
        setError(err);
        handleErrorTimeoutRef.current = null;
        console.log(`[SearchResultsPage][${env}] 🔴 Error state set:`, err.message);
      }, 0);
    }
  }, [env]);

  const handleSearchComplete = useCallback(() => {
    console.log(`[SearchResultsPage][${env}] ✅ Search complete callback triggered`);
  }, [env]);

  const handleRetry = useCallback(() => {
    console.log(`[SearchResultsPage][${env}] 🔄 Retry triggered, resetting error state`);
    // Reset the error state and force a re-render
    setError(null);
  }, [env]);

  // Fix: Add a guard to prevent rerendering if already on this page with same params
  const currentSearchKey = useRef<string>('');
  
  useEffect(() => {
    // Create a unique key for this search to prevent duplicate renders
    const searchKey = `${searchTerm}-${searchType}-${timestamp}`;
    
    if (currentSearchKey.current === searchKey) {
      console.log(`[SearchResultsPage][${env}] 🔄 Duplicate search detected, preventing rerender`);
      return;
    }
    
    currentSearchKey.current = searchKey;
  }, [searchTerm, searchType, timestamp, env]);

  console.log(`[SearchResultsPage][${env}] 🖥️ Rendering with searchState:`, 
    searchState ? { ...searchState, hasSearchTerm: !!searchState.searchTerm } : 'null');
  console.log(`[SearchResultsPage][${env}] 🖥️ Error state:`, error?.message || 'null');

  return (
    <>
      {!searchState?.searchTerm ? (
        <NoSearchStateView onPostcodeSelect={(postcode) => {
          console.log(`[SearchResultsPage][${env}] 📍 Postcode selected from NoSearchStateView: ${postcode}`);
          // Use URL parameters instead of location state
          navigate(`/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`);
        }} />
      ) : error ? (
        <SearchErrorView 
          errorDetails={error.message} 
          onRetry={handleRetry} 
        />
      ) : (
        <SearchView 
          initialSearch={searchState}
          onError={handleError}
          onSearchComplete={handleSearchComplete}
        />
      )}
    </>
  );
};

export default SearchResultsPage;
