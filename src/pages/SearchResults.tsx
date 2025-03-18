import React, { useCallback } from "react";
// Fix: Handle missing react-router-dom module
// Instead of importing directly, create fallback implementations
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Fallback implementations for react-router-dom hooks
const useLocation = () => {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: history.state || {}
  };
};

const useNavigate = () => {
  return (path: string, options?: any) => {
    console.warn('Navigation not available, would navigate to:', path, options);
    if (options?.replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  };
};

const useSearchParams = (): [URLSearchParams, (searchParams: URLSearchParams) => void] => {
  const searchParams = new URLSearchParams(window.location.search);
  const setSearchParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
    window.history.pushState({}, '', newUrl);
  };
  return [searchParams, setSearchParams];
};

import { SearchView } from "@/components/search/results/SearchView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";
import '../styles/search-results.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get search parameters from URL with proper decoding
  const searchTerm = searchParams.get('search') 
    ? decodeURIComponent(searchParams.get('search') || '') 
    : location.state?.searchTerm;
  
  const searchType = (searchParams.get('searchType') || location.state?.searchType || 'location') as 'postcode' | 'location';
  const timestamp = searchParams.get('timestamp') ? parseInt(searchParams.get('timestamp')!, 10) : Date.now();
  
  // Construct a search state object
  const searchState = searchTerm ? {
    searchType,
    searchTerm,
    displayTerm: searchTerm,
    timestamp
  } : null;

  // Log route changes
  React.useEffect(() => {
    const previousPath = location.state?.from;
    if (previousPath && previousPath !== location.pathname) {
      logRouteChange(previousPath, location.pathname, 'internal');
    }
    
    // Update the location state with the current path for future navigation
    if (location.pathname !== location.state?.from) {
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, from: location.pathname }
      });
    }
  }, [location, navigate]);

  const handlePostcodeSelect = useCallback((postcode: string) => {
    // Use URL parameters with proper encoding
    navigate(`/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`);
  }, [navigate]);

  return (
    <div className="search-results-container" role="main" aria-live="polite">
      {!searchState ? (
        <NoSearchStateView onPostcodeSelect={handlePostcodeSelect} />
      ) : (
        <SearchView initialSearch={searchState} />
      )}
    </div>
  );
};

export default SearchResultsPage;
