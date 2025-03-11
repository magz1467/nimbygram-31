import { useEffect, useRef } from "react";
import { useUnifiedSearch } from "@/hooks/applications/use-unified-search";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";

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
    refetch
  } = useUnifiedSearch({ 
    initialSearch, 
    retryCount 
  });

  const hasResultsRef = useRef(false);
  
  useEffect(() => {
    hasResultsRef.current = Boolean(applications && applications.length > 0);
  }, [applications]);

  useEffect(() => {
    if (onError && !isLoading && hasSearched) {
      if (error && shouldShowError(error)) {
        console.log('Reporting error to parent component:', error.message);
        onError(error);
      } else {
        console.log('No critical error to report');
        onError(null);
      }
    }
  }, [error, onError, isLoading, hasSearched, applications]);

  useEffect(() => {
    if (hasSearched && !isLoading && onSearchComplete) {
      console.log('Search completed successfully');
      onSearchComplete();
    }
  }, [hasSearched, isLoading, onSearchComplete]);

  const shouldShowError = (err: Error) => {
    if (!err) return false;
    
    const errorMsg = err.message.toLowerCase();
    
    if (hasResultsRef.current) {
      console.log("Ignoring error because we have results:", err.message);
      return false;
    }
    
    if (errorMsg.includes("application_support") || 
        errorMsg.includes("relation") ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("get_nearby_applications") ||
        errorMsg.includes("could not find the function") ||
        errorMsg.includes("in the schema cache")) {
      console.log("Ignoring non-critical database error:", err.message);
      return false;
    }
    
    return true;
  };

  const handlePageChange = (newPage: number) => {
    if (loadNextPage) {
      loadNextPage(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  const filteredError = error && !isLoading && hasSearched && shouldShowError(error) ? error : undefined;

  const hasDisplayApplications = displayApplications && displayApplications.length > 0;

  return (
    <div className="max-w-5xl mx-auto pb-16 pt-0">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        displayTerm={initialSearch.displayTerm}
        resultsCount={hasDisplayApplications ? totalCount : 0}
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

      {filteredError && !hasDisplayApplications && (
        <div className="px-4 lg:px-8 mb-4">
          <ErrorMessage
            title="Error loading results"
            message={filteredError.message}
            onRetry={handleRetry}
            variant="inline"
            showCoverageInfo={false}
          />
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
          error={filteredError && !hasDisplayApplications ? filteredError : undefined}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalCount={totalCount}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};
