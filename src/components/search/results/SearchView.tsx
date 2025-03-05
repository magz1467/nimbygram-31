
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { ResultsContainer } from "./ResultsContainer";
import { NoResultsView } from "./NoResultsView";
import { FilterBarSection } from "./FilterBarSection";
import { useSearchResults } from "@/hooks/applications/use-search-results";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    timestamp?: number;
  };
}

export const SearchView = ({ initialSearch }: SearchViewProps) => {
  console.log('🔄 SearchView rendering with initialSearch:', initialSearch);

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
    statusCounts
  } = useSearchResults({ initialSearch });

  console.log('🌍 SearchView received coordinates:', coordinates);
  console.log('📊 SearchView received applications:', applications?.length);

  console.log('🔄 SearchView render:', {
    hasSearched,
    hasCoordinates: !!coordinates,
    applicationsCount: applications?.length || 0,
    isLoading,
    displayApplicationsCount: displayApplications?.length || 0
  });

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
        <div className="container mx-auto px-4">
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between p-1.5">
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
        handleMarkerClick={handleMarkerClick}
        isLoading={isLoading}
        searchTerm={initialSearch?.searchTerm}
      />
    </div>
  );
};
