
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
    handlePostcodeSelect,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    statusCounts
  } = useSearchResults({ 
    initialSearch, 
    retryCount 
  });

  // Set distance sorting by default for location searches
  useEffect(() => {
    // Only set to distance sort if coordinates are available and no active sort is set
    if (coordinates && (!activeSort || activeSort !== 'distance')) {
      console.log('Auto-setting sort type to distance due to location search');
      handleSortChange('distance');
    }
  }, [coordinates, activeSort, handleSortChange]);

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
        resultsCount={totalCount}
        isLoading={isLoading}
        hasSearched={hasSearched}
        coordinates={coordinates}
        onSelect={handlePostcodeSelect}
      />

      <FilterBarSection 
        activeFilters={activeFilters} 
        activeSort={activeSort}
        onFilterChange={handleFilterUpdate}
        onSortChange={handleSortUpdate}
        coordinates={coordinates}
        hasSearched={hasSearched}
        isLoading={isLoading}
        applications={applications}
        statusCounts={statusCounts || {
          'Under Review': 0,
          'Approved': 0,
          'Declined': 0,
          'Other': 0
        }}
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
