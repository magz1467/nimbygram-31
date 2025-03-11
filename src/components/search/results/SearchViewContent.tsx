
import { useEffect } from "react";
import { useUnifiedSearch } from "@/hooks/applications/use-unified-search";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { StatusCounts } from "@/types/application-types";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    statusCounts,
    loadNextPage,
    refetch // Add this to get the refetch function
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

  // Handler for loading the next page of results
  const handlePageChange = (newPage: number) => {
    if (loadNextPage) {
      loadNextPage(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  // Handler for retrying the search
  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

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

      {error && !isLoading && (
        <div className="px-4 lg:px-8 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex justify-between items-center">
            <div>
              <p className="text-red-800 font-medium">Error loading results</p>
              <p className="text-red-600 text-sm">{error.message}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

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
        />
      </div>
    </div>
  );
};
