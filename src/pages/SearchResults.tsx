
import { useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const searchState = location.state;
  const firstRenderRef = useRef(true);

  // Use useCallback to create stable function references
  const handleError = useCallback((err: Error | null) => {
    if (err) {
      console.log('Search error detected:', err.message);
      setError(err);
    }
  }, []);

  const handleSearchComplete = useCallback(() => {
    console.log('Search complete');
  }, []);

  const handleRetry = useCallback(() => {
    // Instead of reloading the page, reset the error state and force a re-render
    setError(null);
  }, []);

  // If we don't have search state, show the no search state view
  if (!searchState?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={(postcode) => {
      navigate('/search-results', {
        state: {
          searchType: 'location',
          searchTerm: postcode,
          displayTerm: postcode,
          timestamp: Date.now()
        }
      });
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
