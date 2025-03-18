import React, { useState, useCallback, useEffect } from "react";
// Fix: Create better fallback implementations for react-router-dom

// Fallback implementation for useLocation
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
    console.log('Navigating to:', path, options);
    
    if (options?.replace) {
      window.history.replaceState(
        options?.state || {},
        '',
        path
      );
    } else {
      window.history.pushState(
        options?.state || {},
        '',
        path
      );
    }
    
    // Dispatch a custom event to notify about the navigation
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
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const setSearchParams = useCallback((newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
    window.history.pushState({}, '', newUrl);
    setSearchParamsState(newParams);
    
    // Dispatch a popstate event to notify about the change
    window.dispatchEvent(new Event('popstate'));
  }, []);
  
  return [searchParams, setSearchParams] as const;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Extract search parameters from URL on component mount and when URL changes
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    const searchType = searchParams.get('searchType') as 'postcode' | 'location';
    const timestamp = parseInt(searchParams.get('timestamp') || '0', 10);
    
    console.log('Search params changed:', { searchTerm, searchType, timestamp });
    
    if (searchTerm && searchType) {
      setSearchState({
        searchTerm,
        searchType,
        displayTerm: searchTerm,
        timestamp
      });
      
      // Automatically start search when parameters are available
      setIsLoading(true);
      setIsSubmitting(true);
      setError(null);
    } else {
      setSearchState(null);
      setIsLoading(false);
      setIsSubmitting(false);
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
    setIsLoading(false);
    setIsSubmitting(false);
    if (error) {
      console.error('Search error:', error.message);
    }
  }, []);
  
  // Handle search completion
  const handleSearchComplete = useCallback(() => {
    setIsSubmitting(false);
    setIsLoading(false);
    console.log('Search complete');
  }, []);
  
  // Handle search start
  const handleSearchStart = useCallback(() => {
    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
    console.log('Search started');
  }, []);
  
  // Handle postcode selection
  const handlePostcodeSelect = useCallback((postcode: string) => {
    console.log('Postcode selected:', postcode);
    // Use URL parameters with proper encoding
    const newPath = `/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`;
    navigate(newPath);
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
