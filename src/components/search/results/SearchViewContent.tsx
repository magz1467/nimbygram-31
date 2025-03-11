
import { useEffect, useState } from "react";
import { useUnifiedSearch } from "@/hooks/applications/use-unified-search";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { StatusCounts } from "@/types/application-types";
import { fetchSpatialApplications } from "@/services/applications/fetch-spatial-applications";
import { Application } from "@/types/planning";
import { sortApplicationsByDistance } from "@/utils/distance";

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
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
  const handlePageChange = async (newPage: number) => {
    if (!coordinates) return;
    
    try {
      setIsLoadingMore(true);
      
      // Fetch the next page of results
      const { applications: newApplications } = await fetchSpatialApplications({
        coordinates,
        page: newPage,
        pageSize: 25,
        status: activeFilters.status,
        type: activeFilters.type,
        classification: activeFilters.classification
      });
      
      // Update the current page
      setCurrentPage(newPage);
      
    } catch (err) {
      console.error('Error loading more results:', err);
    } finally {
      setIsLoadingMore(false);
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
          isLoading={isLoading || isLoadingMore}
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
