
import { useEffect, useState } from "react";
import { useUnifiedSearch } from "@/hooks/applications/use-unified-search";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { StatusCounts } from "@/types/application-types";
import { LoadingSkeletons } from "./components/LoadingSkeletons";

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
  const [isLongSearch, setIsLongSearch] = useState(false);
  
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
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    statusCounts,
    loadNextPage,
    refetch
  } = useUnifiedSearch({ 
    initialSearch, 
    retryCount 
  });

  // Set a timeout to detect long searches (> 5 seconds)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLongSearch(true);
      }, 5000);
    } else {
      setIsLongSearch(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

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

  // Handler for loading the next page of results
  const handlePageChange = (newPage: number) => {
    if (loadNextPage) {
      loadNextPage(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  // If loading and no results yet, show loading skeletons
  if (isLoading && (!displayApplications || displayApplications.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto pb-16 pt-4 px-4">
        <LoadingSkeletons 
          isLongSearch={isLongSearch} 
          onRetry={() => refetch && refetch()}
        />
      </div>
    );
  }

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
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalCount={totalCount}
          isLongSearch={isLongSearch}
          onRetry={() => refetch && refetch()}
        />
      </div>
    </div>
  );
};
