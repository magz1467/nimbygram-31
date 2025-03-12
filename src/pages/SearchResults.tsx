
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { logRouteChange } from "@/utils/reloadTracker";
import { Header } from "@/components/Header";
import { formatErrorMessage } from "@/utils/errors";
import { ErrorType, detectErrorType } from "@/utils/errors";

// For tracking renders
const renderCounts = { page: 0 };

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(ErrorType.UNKNOWN);
  const searchState = location.state;
  const firstRenderRef = useRef(true);
  const handleErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPath = useRef<string | null>(null);
  const componentId = useRef(`sr-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const searchCompleteCalledRef = useRef(false);
  
  // Track renders
  renderCountRef.current += 1;
  renderCounts.page += 1;
  
  // Log mount and render information
  useEffect(() => {
    console.log(`🌟 SearchResultsPage [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      searchState: searchState ? {
        searchTerm: searchState.searchTerm,
        timestamp: searchState.timestamp
      } : 'none',
      path: location.pathname,
      renderCount: renderCountRef.current,
      totalPageRenders: renderCounts.page
    });
    
    return () => {
      console.log(`🌑 SearchResultsPage [${componentId}] UNMOUNTED after ${renderCountRef.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
      });
    };
  }, [componentId, location.pathname, searchState]);

  // Log route changes
  useEffect(() => {
    console.log(`🧭 SearchResultsPage location changed [${componentId}]`, {
      pathname: location.pathname,
      search: location.search,
      state: location.state ? {
        searchType: location.state.searchType,
        searchTerm: location.state.searchTerm,
        timestamp: location.state.timestamp
      } : 'none',
      renderCount: renderCountRef.current
    });
    
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
  }, [location, componentId]);

  // Use useCallback to create stable function references
  const handleError = useCallback((err: Error | any) => {
    if (err) {
      console.log(`❌ SearchResultsPage error detected [${componentId}]:`, err);
      
      // Prevent setting state during render cycle
      if (handleErrorTimeoutRef.current) {
        clearTimeout(handleErrorTimeoutRef.current);
      }
      
      handleErrorTimeoutRef.current = setTimeout(() => {
        // Create a proper error object with formatted message
        const errorObj = err instanceof Error ? err : new Error(formatErrorMessage(err));
        console.log(`❌ SearchResultsPage setting error state [${componentId}]`, errorObj);
        setError(errorObj);
        setErrorType(detectErrorType(err));
        handleErrorTimeoutRef.current = null;
      }, 0);
    }
  }, [componentId]);

  const handleSearchComplete = useCallback(() => {
    console.log(`✅ SearchResultsPage search complete [${componentId}]`, {
      alreadyCalled: searchCompleteCalledRef.current,
      renderCount: renderCountRef.current
    });
    searchCompleteCalledRef.current = true;
  }, [componentId]);

  const handleRetry = useCallback(() => {
    // Reset the error state and force a re-render
    console.log(`🔄 SearchResultsPage retry [${componentId}]`);
    setError(null);
  }, [componentId]);

  console.log(`📝 SearchResultsPage render [${componentId}]`, {
    hasError: !!error,
    hasSearchState: !!searchState?.searchTerm,
    renderCount: renderCountRef.current
  });

  return (
    <>
      <Header />
      {!searchState?.searchTerm ? (
        <NoSearchStateView onPostcodeSelect={(postcode) => {
          console.log(`🔍 SearchResultsPage postcode selected [${componentId}]`, postcode);
          navigate('/search-results', {
            state: {
              searchType: 'location',
              searchTerm: postcode,
              displayTerm: postcode,
              timestamp: Date.now()
            }
          });
        }} />
      ) : error ? (
        <SearchErrorView 
          errorDetails={error.message} 
          errorType={errorType}
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
