
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { ResultsContainer } from "./ResultsContainer";
import { NoResultsView } from "./NoResultsView";
import { FilterBarSection } from "./FilterBarSection";
import { useSearchResults } from "@/hooks/applications/use-search-results";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortType } from "@/types/application-types";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    timestamp?: number;
  };
}

export const SearchView = ({ initialSearch }: SearchViewProps) => {
  console.log('🔄 SearchView rendering with initialSearch:', initialSearch);
  const isMobile = useIsMobile();

  const {
    postcode,
    coordinates,
    applications,
    displayApplications,
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
    refetch
  } = useSearchResults({ initialSearch });

  console.log('🌍 SearchView received coordinates:', coordinates);
  console.log('📊 SearchView received applications:', applications?.length);

  // Handle marker click to show side map and select application
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
  if (!isLoading && !displayApplications?.length && !coordinates) {
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
        onRetry={handleRetry}
      />
    </div>
  );
};
