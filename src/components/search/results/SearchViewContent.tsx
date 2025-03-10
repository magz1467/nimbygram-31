
import { useEffect } from "react";
import { useUnifiedSearch } from "@/hooks/applications/use-unified-search";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";

interface SearchViewContentProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  retryCount?: number;
}

export const SearchViewContent = ({ 
  initialSearch, 
  onError, 
  onSearchComplete,
  retryCount = 0
}: SearchViewContentProps) => {
  const {
    postcode,
    coordinates,
    displayApplications,
    applications,
    isLoading,
    hasSearched,
    showMap,
    setShowMap,
    selectedId,
    setSelectedId,
    handleMarkerClick,
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
    handlePostcodeSelect,
    error,
    hasMore,
    loadMoreResults,
    totalCount,
    statusCounts
  } = useUnifiedSearch({ 
    initialSearch, 
    retryCount 
  });

  // Call the onError handler when an error occurs
  useEffect(() => {
    if (onError) {
      onError(error);
    }
  }, [error, onError]);

  // Call the onSearchComplete handler when search is done
  useEffect(() => {
    if (hasSearched && !isLoading && onSearchComplete) {
      onSearchComplete();
    }
  }, [hasSearched, isLoading, onSearchComplete]);

  return (
    <div className="max-w-7xl mx-auto pb-16 pt-0">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        displayTerm={initialSearch.displayTerm}
        resultsCount={totalCount}
        isLoading={isLoading}
        hasSearched={hasSearched}
        coordinates={coordinates}
        onSelect={handlePostcodeSelect}
        activeFilters={activeFilters}
        activeSort={activeSort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        applications={applications}
        statusCounts={statusCounts}
      />

      <div className="px-4 lg:px-8">
        <ResultsContainer
          displayApplications={displayApplications}
          applications={applications}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          searchTerm={initialSearch.searchTerm}
          displayTerm={initialSearch.displayTerm}
          error={error}
          hasMore={hasMore}
          loadMoreResults={loadMoreResults}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
};
