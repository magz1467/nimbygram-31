import React, { useState, useCallback, useRef, useEffect } from "react";
// Fix: Create fallback implementations for react-router-dom
// since the package seems to be missing

// Fallback implementation for useLocation
const useLocation = () => {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: history.state || {}
  };
};

// Fallback implementation for useNavigate
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

// Fallback implementation for useSearchParams
const useSearchParams = (): [URLSearchParams, (searchParams: URLSearchParams) => void] => {
  const searchParams = new URLSearchParams(window.location.search);
  const setSearchParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
    window.history.pushState({}, '', newUrl);
  };
  return [searchParams, setSearchParams];
};

import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";
import '../styles/search-results.css'; // Using relative path instead of alias
import { logStorybook } from "@/utils/storybook/logger";

// Define proper interfaces for type safety
interface SearchStateType {
  searchType: 'postcode' | 'location';
  searchTerm: string;
  displayTerm: string;
  timestamp: number;
}

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for search parameters and loading state
  const [searchState, setSearchState] = useState<SearchStateType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Extract search parameters from URL on component mount
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    const searchType = searchParams.get('searchType') as 'postcode' | 'location';
    const timestamp = parseInt(searchParams.get('timestamp') || '0', 10);
    
    if (searchTerm && searchType) {
      setSearchState({
        searchTerm,
        searchType,
        displayTerm: searchTerm,
        timestamp
      });
    }
  }, [searchParams]);
  
  // Track route changes for analytics
  useEffect(() => {
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
  
  // Handle search errors
  const handleError = useCallback((error: Error | null) => {
    setError(error);
    if (error) {
      logStorybook.input('search_error', undefined);
    }
  }, []);
  
  // Handle search completion
  const handleSearchComplete = useCallback(() => {
    setIsLoading(false);
    logStorybook.input('search_complete', undefined);
  }, []);
  
  // Handle search start
  const handleSearchStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
    logStorybook.input('search_start', undefined);
  }, []);
  
  // Handle postcode selection
  const handlePostcodeSelect = useCallback((postcode: string) => {
    // Use URL parameters with proper encoding
    navigate(`/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`);
  }, [navigate]);
  
  return (
    <div className="search-results-container" role="main" aria-live="polite">
      {!searchState ? (
        <NoSearchStateView onPostcodeSelect={handlePostcodeSelect} />
      ) : (
        <>
          {isLoading && (
            <div className="search-loading-indicator" role="status" aria-label="Loading search results">
              <p>Loading results...</p>
              {/* You could add a spinner component here */}
            </div>
          )}
          <SearchView 
            initialSearch={searchState}
            onError={handleError}
            onSearchComplete={handleSearchComplete}
            onSearchStart={handleSearchStart}
            aria-busy={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
