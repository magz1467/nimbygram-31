
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
  totalCount = 0
}: ResultsListViewProps) => {
  
  const {
    loadedApplications,
    isLongSearchDetected,
    showErrorMessage,
    hasStartedLoading,
    initialLoadComplete,
    isLastPage,
    handleLoadMore,
    searchDuration
  } = useResultsListState({
    applications,
    isLoading,
    error: error || null,
    pageSize: 10,
    currentPage,
    onPageChange
  });

  // HIGHEST PRIORITY: If we're loading or not fully completed initial load, always show loading state
  if (isLoading || (!initialLoadComplete && hasStartedLoading)) {
    return (
      <LoadingState
        isLongSearchDetected={isLongSearchDetected}
        onRetry={onRetry}
        showErrorMessage={showErrorMessage}
        error={error || null}
      />
    );
  }

  // SECOND PRIORITY: If we have results, show them immediately regardless of loading state
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

  // THIRD PRIORITY: Show error view for timeout errors when we truly have no results
  if (!isLoading && error && (!applications?.length && !loadedApplications?.length)) {
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

  // FOURTH PRIORITY: Show "no results" message only when initial load is TRULY complete
  // and we have waited a significant amount of time to be sure the search is done
  if (!isLoading && !error && initialLoadComplete && searchDuration > 12000) {
    return (
      <NoResultsMessage
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        postcode={postcode}
        onRetry={onRetry}
      />
    );
  }

  // Fallback to loading state if none of the above conditions are met
  return (
    <LoadingState
      isLongSearchDetected={isLongSearchDetected}
      onRetry={onRetry}
      showErrorMessage={showErrorMessage}
      error={error || null}
    />
  );
};
