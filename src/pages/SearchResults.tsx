
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { useSearchState } from "@/hooks/applications/use-search-state";
import { useMapApplications } from "@/hooks/use-map-applications";

const SearchResultsPage = () => {
  const {
    postcode,
    coordinates,
    isLoadingCoords,
    handlePostcodeSelect,
  } = useSearchState();

  const { applications, isLoading } = useMapApplications(coordinates);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchSection
        onPostcodeSelect={handlePostcodeSelect}
        isMapView={false}
        applications={applications}
      />
      <main className="container mx-auto px-4 py-6">
        <SearchResultsList 
          applications={applications} 
          isLoading={isLoading || isLoadingCoords} 
        />
      </main>
    </div>
  );
};

export default SearchResultsPage;

