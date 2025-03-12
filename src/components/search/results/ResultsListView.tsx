import { Application } from "@/types/planning";
import { useResultsListState } from "@/hooks/search/useResultsListState";
import { LoadingState } from "./components/LoadingState";
import { TimeoutErrorMessage } from "./components/TimeoutErrorMessage";
import { NoResultsMessage } from "./components/NoResultsMessage";
import { ResultsList } from "./components/ResultsList";
import { useEffect, useState } from "react";

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

  const [hadResults, setHadResults] = useState(false);
  
  useEffect(() => {
    if (applications?.length > 0 || loadedApplications?.length > 0) {
      setHadResults(true);
    }
  }, [applications, loadedApplications]);

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

  if (isLoading || (!initialLoadComplete && hasStartedLoading) || searchDuration < 15000) {
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

  if (!isLoading && !error && initialLoadComplete && searchDuration < 15000) {
    return (
      <NoResultsMessage
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        postcode={postcode}
        onRetry={onRetry}
        isStillSearching={true}
      />
    );
  }

  return (
    <NoResultsMessage
      searchTerm={searchTerm}
      displayTerm={displayTerm}
      postcode={postcode}
      onRetry={onRetry}
      isStillSearching={false}
    />
  );
};
