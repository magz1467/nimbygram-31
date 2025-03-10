
import { useEffect } from "react";
import { useSearchResults } from "@/hooks/applications/use-search-results";
import { ResultsContainer } from "./ResultsContainer";
import { FilterBarSection } from "./FilterBarSection";
import { ResultsHeader } from "./ResultsHeader";
import { SortType } from "@/types/application-types";

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
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  } = useSearchResults({ 
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

  // Callback for filter changes
  const handleFilterUpdate = (filterType: string, value: string) => {
    // Reset page to 0 when filters change
    setCurrentPage(0);
    handleFilterChange(filterType, value);
  };

  // Callback for sort changes
  const handleSortUpdate = (sortType: SortType) => {
    // Reset page to 0 when sorting changes
    setCurrentPage(0);
    handleSortChange(sortType);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 pt-4">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        displayTerm={initialSearch.displayTerm}
        resultsCount={applications.length}
        isLoading={isLoading}
      />

      <FilterBarSection 
        activeFilters={activeFilters} 
        activeSort={activeSort}
        onFilterChange={handleFilterUpdate}
        onSortChange={handleSortUpdate}
      />

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
        onPageChange={setCurrentPage}
        totalCount={totalCount}
      />
    </div>
  );
};
