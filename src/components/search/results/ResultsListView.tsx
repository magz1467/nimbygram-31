
import { Application } from "@/types/planning";
import { useResultsListState } from "@/hooks/search/useResultsListState";
import { LoadingState } from "./components/LoadingState";
import { TimeoutErrorMessage } from "./components/TimeoutErrorMessage";
import { NoResultsMessage } from "./components/NoResultsMessage";
import { ResultsList } from "./components/ResultsList";

interface ResultsListViewProps {
  applications: Application[];
  isLoading: boolean;
  onSeeOnMap: (id: number) => void;
  searchTerm?: string;
  displayTerm?: string; 
  onRetry?: () => void;
  selectedId?: number | null;
  coordinates?: [number, number] | null;
  handleMarkerClick?: (id: number) => void;
  allApplications?: Application[];
  postcode?: string;
  error?: Error | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
}

export const ResultsListView = ({ 
  applications, 
  isLoading, 
  onSeeOnMap,
  searchTerm,
  displayTerm, 
  onRetry,
  selectedId,
  coordinates,
  handleMarkerClick,
  allApplications,
  postcode,
  error,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  totalCount = 0,
  hasPartialResults = false,
  isSearchInProgress = false
}: ResultsListViewProps) => {
  
  const {
    loadedApplications,
    isLongSearchDetected,
    showErrorMessage,
    hasStartedLoading,
    initialLoadComplete,
    isLastPage,
    handleLoadMore,
    searchDuration,
    loadingState,
    hadResults
  } = useResultsListState({
    applications,
    isLoading,
    error: error || null,
    pageSize: 10,
    currentPage,
    onPageChange,
    hasPartialResults,
    isSearchInProgress
  });
  
  // First priority: Show results if we have them
  if (applications?.length > 0 || loadedApplications?.length > 0) {
    return (
      <ResultsList
        loadedApplications={loadedApplications.length > 0 ? loadedApplications : applications.slice(0, 10)}
        applications={applications}
        allApplications={allApplications}
        onSeeOnMap={onSeeOnMap}
        selectedId={selectedId}
        coordinates={coordinates}
        handleMarkerClick={handleMarkerClick}
        isLoading={isLoading}
        postcode={postcode}
        isLastPage={isLastPage}
        onRetry={onRetry}
        handleLoadMore={handleLoadMore}
      />
    );
  }

  // Second priority: Show loading state while searching or if we haven't completed initial load
  if (isLoading || isSearchInProgress || (!initialLoadComplete && hasStartedLoading)) {
    return (
      <LoadingState
        isLongSearchDetected={isLongSearchDetected}
        onRetry={onRetry}
        showErrorMessage={showErrorMessage}
        error={error || null}
        searchTerm={searchTerm}
        displayTerm={displayTerm}
      />
    );
  }

  // Third priority: Show error if there's an error and we have no results
  if (!isLoading && error && !hadResults) {
    return (
      <TimeoutErrorMessage
        error={error}
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        postcode={postcode}
        onRetry={onRetry}
      />
    );
  }

  // Fourth priority: Show "no results" with appropriate messaging
  // We don't check searchDuration here to avoid component switching
  return (
    <NoResultsMessage
      searchTerm={searchTerm}
      displayTerm={displayTerm}
      postcode={postcode}
      onRetry={onRetry}
      isStillSearching={searchDuration < 15000}
    />
  );
};
