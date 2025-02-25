import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { useSearchState } from "@/hooks/applications/use-search-state";
import { useMapApplications } from "@/hooks/use-map-applications";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { FilterBar } from "@/components/FilterBar";

const SearchResultsPage = () => {
  const {
    postcode,
    coordinates,
    isLoadingCoords,
    handlePostcodeSelect,
  } = useSearchState();

  const { applications, isLoading: isLoadingApps } = useMapApplications(coordinates);

  const {
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
  } = useFilterSortState();

  // Apply filters and sorting to applications
  const filteredApplications = useFilteredApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates
  );

  // Calculate status counts for the filter dropdown
  const statusCounts = {
    'Under Review': applications?.filter(app => 
      app.status?.toLowerCase().includes('under consideration'))?.length || 0,
    'Approved': applications?.filter(app => 
      app.status?.toLowerCase().includes('approved'))?.length || 0,
    'Declined': applications?.filter(app => 
      app.status?.toLowerCase().includes('declined'))?.length || 0,
    'Other': applications?.filter(app => {
      if (!app.status) return true;
      const status = app.status.toLowerCase();
      return !status.includes('under consideration') && 
             !status.includes('approved') && 
             !status.includes('declined');
    })?.length || 0
  };

  const isLoading = isLoadingCoords || isLoadingApps;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <FilterBar
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                activeFilters={activeFilters}
                activeSort={activeSort}
                applications={applications}
                statusCounts={statusCounts}
                isMapView={false}
              />
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <SearchResultsList 
          applications={filteredApplications}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default SearchResultsPage;
