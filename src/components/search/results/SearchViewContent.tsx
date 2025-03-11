
import { useEffect } from "react";
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

  // Call the onError handler when an error occurs
  useEffect(() => {
    if (onError && !isLoading && hasSearched) {
      // Check if we have an error that should be shown
      if (error && shouldShowError(error)) {
        console.log('Reporting error to parent component:', error.message);
        onError(error);
      } else {
        // If no error or non-critical error, pass null to indicate no error to show
        console.log('No critical error to report');
        onError(null);
      }
    }
  }, [error, onError, isLoading, hasSearched, applications]);

  // Call the onSearchComplete handler when search is done
  useEffect(() => {
    if (hasSearched && !isLoading && onSearchComplete) {
      onSearchComplete();
    }
  }, [hasSearched, isLoading, onSearchComplete]);

  // Function to determine if an error should be displayed to the user
  const shouldShowError = (err: Error) => {
    if (!err) return false;
    
    const errorMsg = err.message.toLowerCase();
    
    // Filter out the application_support table error and similar DB errors
    if (errorMsg.includes("application_support") || 
        errorMsg.includes("relation") ||
        errorMsg.includes("does not exist")) {
      console.log("Ignoring non-critical database error:", err.message);
      return false;
    }
    
    // Ignore errors if we have results anyway
    if (applications && applications.length > 0) {
      console.log("Ignoring error because we have results:", err.message);
      return false;
    }
    
    // Show all other errors
    return true;
  };

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

  // Only show error when:
  // 1. There is an error
  // 2. We're not loading
  // 3. We've actually performed a search
  // 4. The error passes our filter criteria
  const filteredError = error && !isLoading && hasSearched && shouldShowError(error) ? error : undefined;

  return (
    <div className="max-w-5xl mx-auto pb-16 pt-0">
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

      {filteredError && (
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
          error={filteredError}
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
