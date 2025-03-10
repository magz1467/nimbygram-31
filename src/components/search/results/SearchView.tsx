
import { useState, useEffect } from 'react';
import { ResultsHeader } from "./ResultsHeader";
import { SearchViewContent } from "./SearchViewContent";
import { NoResultsView } from "./NoResultsView";
import { useSearchResults } from "@/hooks/applications/use-search-results";
import { useSearchViewFilters } from "@/hooks/search/useSearchViewFilters";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string; 
    timestamp?: number;
  };
  retryCount?: number;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}

export const SearchView = ({ 
  initialSearch, 
  retryCount = 0, 
  onError,
  onSearchComplete
}: SearchViewProps) => {
  console.log('🔄 SearchView rendering with initialSearch:', initialSearch);

  const {
    postcode,
    coordinates,
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
    statusCounts,
    refetch,
    error
  } = useSearchResults({ 
    initialSearch,
    retryCount
  });

  console.log('🌍 SearchView received coordinates:', coordinates);
  console.log('📊 SearchView received applications:', applications?.length);

  // Report errors back to parent component
  useEffect(() => {
    if (error && onError) {
      console.error('SearchView reporting error to parent:', error);
      onError(error);
    }
  }, [error, onError]);

  // Notify parent when search completes successfully
  useEffect(() => {
    // Only consider the search complete when:
    // 1. We have coordinates
    // 2. We have applications data (or confirmed empty result)
    // 3. Loading has finished
    // 4. No errors occurred
    if (coordinates && !isLoading && hasSearched && !error && onSearchComplete) {
      console.log('Search completed successfully, notifying parent');
      onSearchComplete();
    }
  }, [coordinates, isLoading, hasSearched, error, applications, onSearchComplete]);

  // Use our custom hook for filtering
  const { displayApplications } = useSearchViewFilters({
    applications,
    activeFilters,
    activeSort,
    coordinates,
    searchTerm: initialSearch?.searchTerm
  });

  // Handle marker click to show map and select application
  const handleMapMarkerClick = (id: number) => {
    console.log('🖱️ Map marker clicked:', id);
    setShowMap(true);
    handleMarkerClick(id);
    setSelectedId(id);
  };

  // Retry search function
  const handleRetry = () => {
    console.log('🔄 Retry search requested');
    if (refetch) {
      refetch();
    }
  };

  // Show no results view if appropriate - only after loading is complete and we have no data
  if (!isLoading && !applications?.length && !coordinates) {
    return <NoResultsView onPostcodeSelect={handlePostcodeSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResultsHeader 
        onPostcodeSelect={handlePostcodeSelect}
        isMapView={false}
        applications={applications}
      />
      
      <SearchViewContent
        isLoading={isLoading}
        coordinates={coordinates}
        hasSearched={hasSearched}
        applications={applications}
        activeFilters={activeFilters}
        activeSort={activeSort}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        statusCounts={statusCounts}
        displayApplications={displayApplications}
        showMap={showMap}
        setShowMap={setShowMap}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        handleMarkerClick={handleMapMarkerClick}
        searchTerm={initialSearch?.searchTerm}
        displayTerm={initialSearch?.displayTerm}
        onRetry={handleRetry}
        error={error}
      />
    </div>
  );
};
