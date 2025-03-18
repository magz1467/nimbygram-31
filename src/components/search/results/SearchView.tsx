
import { useEffect } from 'react';
import { SearchStateProvider, useSearchState } from './search-views/SearchStateProvider';
import { LoadingView } from './search-views/LoadingView';
import { ErrorView } from './search-views/ErrorView';
import { ResultsView } from './search-views/ResultsView';
import { NoSearchStateView } from './NoSearchStateView';
import { ErrorType, detectErrorType } from '@/utils/errors';
import { useNavigate, useLocation } from 'react-router-dom';

// This is the inner component that uses the search state context
function SearchViewContent() {
  const { 
    initialSearch, 
    loadingState, 
    applications, 
    filters, 
    setFilters,
    retry,
    hasSearched,
    hasPartialResults,
    isSearchInProgress,
    coordinates
  } = useSearchState();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle navigation to the map view
  const handleToggleMapView = () => {
    // Navigate to the map view with search parameters
    const params = new URLSearchParams();
    if (initialSearch?.searchTerm) {
      params.set('postcode', initialSearch.searchTerm);
    }
    
    // Store the current search results and coordinates in state
    navigate(`/map?${params.toString()}`, { 
      state: { 
        applications,
        searchTerm: initialSearch?.searchTerm,
        coordinates
      } 
    });
  };
  
  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }
  
  // Show error view if there's an error and we've already searched
  if ((loadingState.error || loadingState.stage === 'error') && hasSearched) {
    const error = loadingState.error || new Error('Unknown search error');
    const errorType = 'type' in error ? error.type as ErrorType : detectErrorType(error);
    
    return (
      <ErrorView 
        error={error} 
        errorType={errorType} 
        onRetry={retry} 
      />
    );
  }
  
  // Show loading view if we're loading
  if (loadingState.isLoading || loadingState.stage !== 'complete') {
    return (
      <LoadingView 
        stage={loadingState.stage}
        isLongRunning={loadingState.longRunning}
        searchTerm={initialSearch.searchTerm}
        onRetry={retry}
      />
    );
  }
  
  // Show results view when we have applications
  return (
    <ResultsView 
      applications={applications}
      searchTerm={initialSearch.searchTerm}
      filters={filters}
      onFilterChange={setFilters}
      hasPartialResults={hasPartialResults}
      isSearchInProgress={isSearchInProgress}
      onToggleMapView={handleToggleMapView}
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
}

export function SearchView({ 
  initialSearch,
  onError,
  onSearchComplete
}: SearchViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SearchStateProvider initialSearch={initialSearch}>
          <SearchViewContentWithCallbacks 
            onError={onError} 
            onSearchComplete={onSearchComplete} 
          />
        </SearchStateProvider>
      </div>
    </div>
  );
}

// This component handles the callbacks
function SearchViewContentWithCallbacks({ 
  onError, 
  onSearchComplete 
}: {
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}) {
  const { loadingState, hasSearched } = useSearchState();
  
  // Call onError when there's an error
  useEffect(() => {
    if (onError && loadingState.error) {
      onError(loadingState.error);
    }
  }, [loadingState.error, onError]);
  
  // Call onSearchComplete when search is complete
  useEffect(() => {
    if (onSearchComplete && loadingState.stage === 'complete' && hasSearched) {
      onSearchComplete();
    }
  }, [loadingState.stage, hasSearched, onSearchComplete]);
  
  return <SearchViewContent />;
}
