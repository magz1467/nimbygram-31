
import { useEffect } from 'react';
import { SearchStateProvider, useSearchState } from './search-views/SearchStateProvider';
import { LoadingView } from './search-views/LoadingView';
import { ErrorView } from './search-views/ErrorView';
import { ResultsView } from './search-views/ResultsView';
import { NoSearchStateView } from './NoSearchStateView';
import { ErrorType, detectErrorType } from '@/utils/errors';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentHostname, getEnvironmentName } from '@/utils/environment';
import { Application } from '@/types/planning';
import { Dispatch, SetStateAction } from 'react';
import { LoadingStage } from '@/hooks/use-loading-state';

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
  const env = getEnvironmentName();
  const hostname = getCurrentHostname();
  
  console.log(`[SearchViewContent][${env}][${hostname}] Rendering with initialSearch:`, initialSearch);
  console.log(`[SearchViewContent][${env}] LoadingState:`, {
    stage: loadingState.stage,
    isLoading: loadingState.isLoading,
    hasError: !!loadingState.error,
    errorMessage: loadingState.error?.message
  });
  
  useEffect(() => {
    // Debug to track if component remounts or rerenders
    console.log(`[SearchViewContent][${env}] MOUNTED/UPDATED with searchTerm:`, 
      initialSearch?.searchTerm, 'timestamp:', initialSearch?.timestamp);
    
    return () => {
      console.log(`[SearchViewContent][${env}] UNMOUNTED with searchTerm:`, 
        initialSearch?.searchTerm);
    };
  }, [initialSearch, env]);
  
  // Handle navigation to the map view
  const handleToggleMapView = () => {
    console.log(`[SearchViewContent][${env}] Toggling to map view`);
    // Navigate to the map view with search parameters
    const params = new URLSearchParams();
    if (initialSearch?.searchTerm) {
      params.set('postcode', initialSearch.searchTerm);
    }
    
    console.log(`[SearchViewContent][${env}] Navigating to map with postcode:`, initialSearch?.searchTerm);
    
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
    console.log(`[SearchViewContent][${env}] No search term provided, showing NoSearchStateView`);
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }
  
  // Show error view if there's an error and we've already searched
  if ((loadingState.error || loadingState.stage === 'error') && hasSearched) {
    const error = loadingState.error || new Error('Unknown search error');
    const errorType = 'type' in error ? error.type as ErrorType : detectErrorType(error);
    
    console.log(`[SearchViewContent][${env}] Showing error view:`, {
      message: error.message,
      type: errorType
    });
    
    return (
      <ErrorView 
        error={error} 
        errorType={errorType} 
        onRetry={retry} 
      />
    );
  }
  
  // Show loading view if we're loading
  if (loadingState.isLoading || (loadingState.stage !== 'complete' && loadingState.stage !== 'error')) {
    console.log(`[SearchViewContent][${env}] Showing loading view. Stage:`, loadingState.stage);
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
  console.log(`[SearchViewContent][${env}] Showing results view with ${applications.length} applications`);
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
  applications?: Application[];
  isLoading?: boolean;
  searchTerm?: string;
  displayTerm?: string;
  coordinates?: [number, number] | null;
  showMap?: boolean;
  setShowMap?: Dispatch<SetStateAction<boolean>>;
  selectedId?: number | null;
  setSelectedId?: Dispatch<SetStateAction<number | null>>;
  handleMarkerClick?: (id: number) => void;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}

export function SearchView({ 
  initialSearch,
  applications,
  isLoading,
  searchTerm,
  displayTerm,
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  hasPartialResults,
  isSearchInProgress,
  onError,
  onSearchComplete
}: SearchViewProps) {
  const env = getEnvironmentName();
  
  console.log(`[SearchView][${env}] Initializing with search params:`, initialSearch);
  
  // Construct initialSearch from props if not provided directly
  const effectiveInitialSearch = initialSearch || (searchTerm ? {
    searchType: 'postcode',
    searchTerm: searchTerm,
    displayTerm: displayTerm || searchTerm,
    timestamp: Date.now()
  } : undefined);
  
  // Add debugging for initialSearch props
  useEffect(() => {
    console.log(`[SearchView][${env}] initialSearch CHANGED:`, {
      searchTerm: effectiveInitialSearch?.searchTerm,
      searchType: effectiveInitialSearch?.searchType,
      timestamp: effectiveInitialSearch?.timestamp
    });
  }, [effectiveInitialSearch, env]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SearchStateProvider 
          initialSearch={effectiveInitialSearch}
          initialApplications={applications}
          initialIsLoading={isLoading}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={handleMarkerClick}
          hasPartialResults={hasPartialResults}
          isSearchInProgress={isSearchInProgress}
        >
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
  const env = getEnvironmentName();
  
  // Call onError when there's an error
  useEffect(() => {
    if (onError && loadingState.error) {
      console.log(`[SearchViewCallbacks][${env}] Calling onError with:`, loadingState.error.message);
      onError(loadingState.error);
    }
  }, [loadingState.error, onError, env]);
  
  // Call onSearchComplete when search is complete
  useEffect(() => {
    if (onSearchComplete && loadingState.stage === 'complete' && hasSearched) {
      console.log(`[SearchViewCallbacks][${env}] Calling onSearchComplete`);
      onSearchComplete();
    }
  }, [loadingState.stage, hasSearched, onSearchComplete, env]);
  
  return <SearchViewContent />;
}
