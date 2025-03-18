import React, { useEffect, ReactNode } from 'react';
import { SearchStateProvider, useSearchState } from '@/hooks/search/useSearchState';
import { LoadingView } from './search-views/LoadingView';
import { ErrorView } from './search-views/ErrorView';
import { ResultsView } from './search-views/ResultsView';
import { NoSearchStateView } from './NoSearchStateView';
import { ErrorType, detectErrorType } from '@/utils/errors';
// Fix #1: Handle missing react-router-dom module
// Instead of importing directly, check if it's available at runtime
// const { useNavigate } = require('react-router-dom');
const useNavigate = () => {
  return (path: string, options?: any) => {
    console.warn('Navigation not available, would navigate to:', path, options);
    window.location.href = path;
  };
};

// This is the inner component that uses the search state context
function SearchViewContent() {
  const { 
    searchTerm,
    displayTerm,
    applications,
    filteredApplications,
    coordinates,
    isLoading,
    error,
    hasSearched,
    filters,
    setFilters,
    retry,
    hasPartialResults,
    isSearchInProgress,
    longRunningSearch
  } = useSearchState();
  
  // Fix #1: Use our custom navigate function
  const navigate = useNavigate();
  
  // Handle navigation to the map view
  const handleToggleMapView = () => {
    // Navigate to the map view with search parameters
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('postcode', searchTerm);
    }
    
    // Store the current search results and coordinates in state
    navigate(`/map?${params.toString()}`, { 
      state: { 
        applications: filteredApplications,
        searchTerm,
        coordinates
      } 
    });
  };
  
  if (!searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }
  
  // Show error view if there's an error and we've already searched
  if (error && hasSearched) {
    const errorType = error && 'type' in error ? error.type as ErrorType : detectErrorType(error);
    
    return (
      <ErrorView 
        error={error} 
        errorType={errorType} 
        onRetry={retry} 
      />
    );
  }
  
  // Show loading view if we're loading
  if (isLoading || isSearchInProgress) {
    // Fix: Use the exact string literals that match LoadingView's expected values
    // without trying to type them ourselves
    return (
      <LoadingView 
        stage={isSearchInProgress ? "searching" : "loading"}
        isLongRunning={longRunningSearch || false}
        searchTerm={searchTerm || ''}
        onRetry={retry}
      />
    );
  }
  
  // Show results view when we have applications
  return (
    <ResultsView 
      applications={filteredApplications || []}
      searchTerm={searchTerm || ''}
      displayTerm={displayTerm}
      filters={filters || {}}
      onFilterChange={setFilters}
      hasPartialResults={hasPartialResults || false}
      isSearchInProgress={isSearchInProgress || false}
      onToggleMapView={handleToggleMapView}
      retry={retry}
    />
  );
}

// This is the wrapper component that provides the search state context
interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  onSearchStart?: () => void;
  'aria-busy'?: boolean;
  // Fix #3: Add children prop type
  children?: ReactNode;
}

// This component handles the callbacks
function SearchViewContentWithCallbacks({ 
  onError, 
  onSearchComplete,
  onSearchStart,
  // Fix #3: Add children prop
  children
}: {
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  onSearchStart?: () => void;
  children?: ReactNode;
}) {
  const { 
    isLoading, 
    isSearchInProgress, 
    hasSearched, 
    error 
  } = useSearchState();
  
  // Call onError when there's an error
  useEffect(() => {
    if (onError) {
      onError(error);
    }
  }, [error, onError]);
  
  // Call onSearchComplete when search is complete
  useEffect(() => {
    if (onSearchComplete && !isLoading && !isSearchInProgress && hasSearched) {
      onSearchComplete();
    }
  }, [isLoading, isSearchInProgress, hasSearched, onSearchComplete]);
  
  // Call onSearchStart when search begins
  useEffect(() => {
    if (onSearchStart && isSearchInProgress) {
      onSearchStart();
    }
  }, [isSearchInProgress, onSearchStart]);
  
  // Add a cleanup effect to reset error when component unmounts
  useEffect(() => {
    return () => {
      if (onError) {
        onError(null);
      }
    };
  }, [onError]);
  
  // Fix #3: Return children along with SearchViewContent
  return (
    <>
      <SearchViewContent />
      {children}
    </>
  );
}

export function SearchView({ 
  initialSearch,
  onError,
  onSearchComplete,
  onSearchStart,
  'aria-busy': ariaBusy,
  children
}: SearchViewProps) {
  // Call onSearchStart immediately if we have an initial search
  useEffect(() => {
    if (initialSearch?.searchTerm && onSearchStart) {
      onSearchStart();
    }
  }, [initialSearch, onSearchStart]);

  useEffect(() => {
    if (initialSearch) {
      console.log("SearchView received initialSearch:", initialSearch);
      // Log the actual Supabase query being constructed
      console.log("Constructing Supabase query with:", {
        searchTerm: initialSearch.searchTerm,
        searchType: initialSearch.searchType
      });
    }
  }, [initialSearch]);

  return (
    <div className="min-h-screen bg-gray-50" aria-busy={ariaBusy}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SearchStateProvider 
          initialSearch={initialSearch}
          children={
            <SearchViewContentWithCallbacks 
              onError={onError} 
              onSearchComplete={onSearchComplete}
              onSearchStart={onSearchStart}
            >
              {children}
            </SearchViewContentWithCallbacks>
          }
        />
      </div>
    </div>
  );
}
