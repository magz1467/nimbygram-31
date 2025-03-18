import React, { useState, useCallback, useEffect } from "react";
// Fix: Create better fallback implementations for react-router-dom

// Comprehensive fix for the main search page
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";
import '../styles/search-results.css'; // Using relative path instead of alias
import { logStorybook } from "@/utils/storybook/logger";
import { ErrorType } from "@/utils/errors";

// Define proper interfaces for type safety
interface SearchState {
  searchType: "location" | "postcode";
  searchTerm: string;
  displayTerm?: string;
  timestamp?: number;
}

// Simple router implementation
const useLocation = () => {
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: history.state || {}
  });

  useEffect(() => {
    const handlePopState = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        state: history.state || {}
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return location;
};

// Fallback implementation for useNavigate
const useNavigate = () => {
  return useCallback((path: string, options?: any) => {
    if (options?.replace) {
      window.history.replaceState(options?.state || {}, '', path);
    } else {
      window.history.pushState(options?.state || {}, '', path);
    }
    window.dispatchEvent(new Event('popstate'));
  }, []);
};

// Fallback implementation for useSearchParams
const useSearchParams = () => {
  const [searchParams, setSearchParamsState] = useState(
    new URLSearchParams(window.location.search)
  );
  
  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsState(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const setSearchParams = useCallback((newParams: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => {
    const params = typeof newParams === 'function' ? newParams(searchParams) : newParams;
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.pushState({}, '', newUrl);
    setSearchParamsState(params);
    window.dispatchEvent(new Event('popstate'));
  }, [searchParams]);
  
  return [searchParams, setSearchParams] as const;
};

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for search parameters and loading state
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Extract search parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const search = searchParams.get('search');
    const searchTypeParam = searchParams.get('searchType');
    
    console.log("Search params:", { search, searchTypeParam });
    
    // Validate the searchType to ensure it matches the expected union type
    const searchType = searchTypeParam === "location" || searchTypeParam === "postcode" 
      ? searchTypeParam 
      : "location"; // Default to location if invalid
    
    if (search) {
      const searchStateObj = {
        searchTerm: search,
        searchType: searchType,
        displayTerm: search,
        timestamp: Date.now()
      };
      
      console.log("Setting search state:", searchStateObj);
      setSearchState(searchStateObj);
      setIsLoading(true);
    } else {
      setSearchState(null);
      setIsLoading(false);
    }
  }, [window.location.search]);
  
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
  
  // Add this effect to log API errors
  useEffect(() => {
    if (error) {
      console.error('Search API error:', error);
      // You could also add a more user-friendly error message here
    }
  }, [error]);
  
  // Handle errors
  const handleError = useCallback((error: Error | null) => {
    console.error('Search error:', error);
    setError(error);
    setIsLoading(false);
    setIsSubmitting(false);
  }, []);
  
  // Handle search completion
  const handleSearchComplete = useCallback(() => {
    console.log('Search complete');
    setIsSubmitting(false);
    setIsLoading(false);
  }, []);
  
  // Handle search start
  const handleSearchStart = useCallback(() => {
    console.log('Search started');
    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
  }, []);
  
  // Handle postcode selection
  const handlePostcodeSelect = useCallback((postcode: string) => {
    console.log('Postcode selected:', postcode);
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
          {error && (
            <div className="search-error">
              <p>Error: {error.message}</p>
              <button onClick={() => {
                setError(null);
                setIsLoading(true);
                // Re-trigger the search
                if (searchState) {
                  const newSearchState = {...searchState, timestamp: Date.now()};
                  setSearchState(newSearchState);
                }
              }}>
                Retry
              </button>
            </div>
          )}
          <SearchView 
            initialSearch={searchState}
            onError={(err) => {
              console.error("Search error details:", err);
              handleError(err);
            }}
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
