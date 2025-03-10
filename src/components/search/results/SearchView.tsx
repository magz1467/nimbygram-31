
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { ResultsContainer } from "./ResultsContainer";
import { NoResultsView } from "./NoResultsView";
import { FilterBarSection } from "./FilterBarSection";
import { useSearchResults } from "@/hooks/applications/use-search-results";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { useEffect } from "react";

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
  const isMobile = useIsMobile();

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

  // Use the filtered applications hook with coordinates and search term
  const displayApplications = useFilteredApplications(
    applications || [],
    activeFilters,
    activeSort,
    coordinates,
    initialSearch?.searchTerm // Pass search term for location relevance
  );

  // Handle marker click to show map and select application
  const handleMapMarkerClick = (id: number) => {
    console.log('🖱️ Map marker clicked:', id);
    setShowMap(true);
    handleMarkerClick(id);
    setSelectedId(id);
  };

  // Retry search function
  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  // Show no results view if appropriate
  if (!isLoading && !applications?.length && !coordinates) {
    return <NoResultsView onPostcodeSelect={handlePostcodeSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <LoadingOverlay />}
      <Header />
      <SearchSection
        onPostcodeSelect={handlePostcodeSelect}
        isMapView={false}
        applications={applications}
      />
      <div className="w-full border-t">
        <div className={`mx-auto px-2 ${isMobile ? 'max-w-full' : 'container px-4'}`}>
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between p-1.5 overflow-hidden">
              <FilterBarSection
                coordinates={coordinates}
                hasSearched={hasSearched}
                isLoading={isLoading}
                applications={applications}
                activeFilters={activeFilters}
                activeSort={activeSort}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                statusCounts={statusCounts}
              />
            </div>
          </div>
        </div>
      </div>
      <ResultsContainer
        displayApplications={displayApplications}
        applications={applications}
        coordinates={coordinates}
        showMap={showMap}
        setShowMap={setShowMap}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        handleMarkerClick={handleMapMarkerClick}
        isLoading={isLoading}
        searchTerm={initialSearch?.searchTerm}
        displayTerm={initialSearch?.displayTerm}
        onRetry={handleRetry}
        error={error}
      />
    </div>
  );
};
