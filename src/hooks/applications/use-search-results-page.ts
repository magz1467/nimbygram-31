
import { useEffect } from 'react';
import { useSearchPageState } from './use-search-page-state';
import { useSearchErrorHandler } from './use-search-error-handler';
import { useSearchTimeout } from './use-search-timeout';

export const useSearchResultsPage = () => {
  const {
    searchState,
    retryCount,
    searchComplete,
    setSearchComplete,
    hasResultsRef,
    handleSearchComplete,
    handleRetry,
    prepareForSearch,
    handlePostcodeSelect,
    updateResultsStatus
  } = useSearchPageState();

  const {
    isError,
    errorDetails,
    handleError,
    resetErrors,
    isNonCriticalError
  } = useSearchErrorHandler(hasResultsRef);

  const {
    setupSearchTimeout,
    clearSearchTimeout
  } = useSearchTimeout(
    searchComplete,
    setSearchComplete,
    resetErrors ? () => {
      resetErrors();
      return false;
    } : () => false,
    errorDetails !== null ? () => errorDetails : () => null
  );

  // Update search state when location.state changes
  useEffect(() => {
    if (!searchState?.searchTerm) {
      return;
    }

    console.log('📍 Processing search:', {
      type: searchState.searchType,
      term: searchState.searchTerm,
      timestamp: searchState.timestamp
    });
    
    // Prepare for the new search
    prepareForSearch();
    
    // Reset error state
    resetErrors();
    
    // Set up timeout for the search
    setupSearchTimeout();
  }, [searchState, prepareForSearch, resetErrors, setupSearchTimeout]);

  return {
    searchState,
    retryCount,
    isError,
    errorDetails,
    handleRetry,
    handleError,
    handleSearchComplete,
    handlePostcodeSelect,
    updateResultsStatus
  };
};
