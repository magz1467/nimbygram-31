
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add loading state
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPath = useRef<string | null>(null);

  // Get search parameters from URL with proper decoding
  const searchTerm = searchParams.get('search') 
    ? decodeURIComponent(searchParams.get('search') || '') 
    : location.state?.searchTerm;
  
  const searchType = (searchParams.get('searchType') || location.state?.searchType || 'location') as 'postcode' | 'location';
  const timestamp = searchParams.get('timestamp') ? parseInt(searchParams.get('timestamp')!, 10) : Date.now();
  
  // Construct a search state object with proper typing
  const searchState: SearchStateType | null = searchTerm ? {
    searchType,
    searchTerm,
    displayTerm: searchTerm,
    timestamp
  } : (location.state as SearchStateType | null);

  // Log environment info on initial load to help with debugging
  useEffect(() => {
    // Log environment information to help debug production vs development differences
    const isProd = typeof window !== 'undefined' && 
      window.location.hostname.includes('nimbygram.com');
    
    console.log(`🌍 Environment: ${isProd ? 'Production' : 'Development/Preview'}`);
    console.log(`🔎 Search route loaded with term: ${searchTerm || 'none'}`);
    
    // Force a visible log in production for search debugging
    if (isProd) {
      logStorybook.critical('Search Results Page Loaded', { 
        searchTerm, 
        searchType,
        hasState: Boolean(location.state)
      });
    }
  }, []);
  
  // Log route changes
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      if (previousPath.current) {
        logRouteChange(previousPath.current, location.pathname, 'internal');
      }
      previousPath.current = location.pathname;
    }
    
    // Clean up function to prevent memory leaks
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [location]);

  // Improved error handling without setTimeout
  const handleError = useCallback((err: Error | null) => {
    if (err) {
      console.log('Search error detected:', err.message);
      // Use functional state update to avoid race conditions
      setError(err);
      setIsLoading(false);
    }
  }, []);

  const handleSearchStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const handleSearchComplete = useCallback(() => {
    console.log('Search complete');
    setIsLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    // Reset the error state and force a re-render
    setError(null);
    setIsLoading(true);
    // After a brief delay, set loading to false if no search was triggered
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <div className="search-results-container" role="main" aria-live="polite">
      {!searchState?.searchTerm ? (
        <NoSearchStateView onPostcodeSelect={(postcode) => {
          // Use URL parameters with proper encoding
          navigate(`/search-results?search=${encodeURIComponent(postcode)}&searchType=location&timestamp=${Date.now()}`);
        }} />
      ) : error ? (
        <SearchErrorView 
          errorDetails={error.message} 
          onRetry={handleRetry}
          aria-label="Search error information"
        />
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
