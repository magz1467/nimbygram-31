
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
    handleLoadMore
  } = useResultsListState({
    applications,
    isLoading,
    error: error || null,
    pageSize: 10,
    currentPage,
    onPageChange
  });

  // Always show loading skeleton during initial load or active search
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

  // Only show full error when we're not loading anymore and have no results
  const isTimeoutError = error && 
    (error.message.includes('timeout') || 
     error.message.includes('57014') || 
     error.message.includes('canceling statement'));

  // Show error view for timeout errors with no results
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

  // If we have applications, show them immediately - no waiting needed
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

  // Show "no results" message only when initial load is TRULY complete and we have no results
  // This should only show after a significant delay to ensure search is really done
  if (!isLoading && !error && initialLoadComplete && Date.now() - (hasStartedLoading ? 3000 : 0) > 0) {
    return (
      <NoResultsMessage
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        postcode={postcode}
        onRetry={onRetry}
      />
    );
  }

  // Fallback loading state if none of the above conditions are met
  return (
    <LoadingState
      isLongSearchDetected={isLongSearchDetected}
      onRetry={onRetry}
      showErrorMessage={showErrorMessage}
      error={error || null}
    />
  );
};
