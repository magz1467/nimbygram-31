import { useEffect, useRef, useCallback } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { SearchLoadingState } from "./components/SearchLoadingState";
import { useSearchStage } from "@/hooks/search/use-search-stage";
import { useSearchError } from "@/hooks/search/use-search-error";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  retryCount?: number;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}

export const SearchView = ({
  initialSearch,
  retryCount = 0,
  onError,
  onSearchComplete
}: SearchViewProps) => {
  const componentId = useRef(`sv-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const searchCompleteRef = useRef(false);
  const componentRenders = useRef(0);
  
  // Track renders for debugging
  componentRenders.current += 1;
  
  // Log mount information
  useEffect(() => {
    console.log(`🔍 SearchView [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      searchTerm: initialSearch?.searchTerm,
      timestamp: initialSearch?.timestamp,
    });
    
    return () => {
      console.log(`🔍 SearchView [${componentId}] UNMOUNTED after ${componentRenders.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
        searchTerm: initialSearch?.searchTerm,
      });
    };
  }, [componentId, initialSearch?.searchTerm, initialSearch?.timestamp]);

  const searchTerm = initialSearch?.searchTerm || '';
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(searchTerm);
  const { error: searchError, hasResults, applications, isLoading: isLoadingResults, isFetching, searchState } = usePlanningSearch(coordinates);
  
  const { stage, progress } = useSearchStage(isLoadingCoords, isLoadingResults || isFetching);
  const { error, errorType, handleError, clearError } = useSearchError(onError);
  
  const combinedError = coordsError || searchError || searchState.error || error;
  const isLoading = isLoadingCoords || isLoadingResults || isFetching;
  const shouldShowSkeletons = isLoading && !hasResults;

  const handleSearchComplete = useCallback(() => {
    if (!isLoading && coordinates && applications && !searchCompleteRef.current && hasResults) {
      console.log(`✅ Search complete [${componentId}] - calling onSearchComplete`);
      searchCompleteRef.current = true;
      onSearchComplete?.();
    }
  }, [isLoading, coordinates, applications, onSearchComplete, componentId, hasResults]);

  useEffect(() => {
    handleSearchComplete();
  }, [handleSearchComplete]);

  if (!searchTerm) {
    console.log(`⭕ Returning NoSearchStateView [${componentId}]`);
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  if (shouldShowSkeletons) {
    return (
      <SearchLoadingState 
        stage={stage}
        progress={progress}
        searchTerm={searchTerm}
        displayTerm={initialSearch?.displayTerm}
      />
    );
  }

  if (combinedError && !hasResults) {
    return (
      <SearchErrorView 
        errorDetails={combinedError.message}
        errorType={errorType}
        onRetry={() => {
          clearError();
          window.location.reload();
        }}
      />
    );
  }

  return (
    <SearchViewContent
      initialSearch={initialSearch!}
      applications={applications || []}
      isLoading={isLoading}
      onError={handleError}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
