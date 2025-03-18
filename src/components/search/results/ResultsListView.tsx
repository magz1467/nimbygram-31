import React from 'react';
import { Application } from "@/types/planning";
import { LoadingState } from "./components/LoadingState";
import { TimeoutErrorMessage } from "./components/TimeoutErrorMessage";
import { NoResultsMessage } from "./components/NoResultsMessage";
import { ResultsList } from "./components/ResultsList";
import { formatContentWithBullets } from '@/utils/formatters';
import { useSearchState } from '@/hooks/search/useSearchState';

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
  error
}: ResultsListViewProps) => {
  // Use the global search state for consistent state management
  const {
    hasPartialResults,
    isSearchInProgress,
    searchDuration,
    currentPage,
    totalPages,
    loadMore
  } = useSearchState();
  
  const isLastPage = currentPage >= totalPages;
  
  // First priority: Show results if we have them
  if (applications?.length > 0) {
    return (
      <div className="results-list-view">
        <ResultsList
          loadedApplications={applications.slice(0, currentPage * 10)}
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
          handleLoadMore={loadMore}
          formatContent={formatContentWithBullets}
        />
      </div>
    );
  }

  // Second priority: Show loading state while searching
  if (isLoading || isSearchInProgress) {
    return (
      <LoadingState
        isLongSearchDetected={searchDuration > 5000}
        onRetry={onRetry}
        showErrorMessage={!!error}
        error={error || null}
        searchTerm={searchTerm}
        displayTerm={displayTerm}
      />
    );
  }

  // Third priority: Show error if there's an error and we have no results
  if (!isLoading && error) {
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
