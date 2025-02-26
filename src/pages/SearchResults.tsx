
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { useSearchState } from "@/hooks/applications/use-search-state";
import { useMapApplications } from "@/hooks/use-map-applications";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { FilterBar } from "@/components/FilterBar";
import { useEffect, useState, useCallback } from "react";
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SearchResultsPage = () => {
  const location = useLocation();
  const initialPostcode = location.state?.postcode;
  const initialLocation = location.state?.location;
  const { toast } = useToast();

  const {
    postcode,
    coordinates,
    isLoadingCoords,
    handlePostcodeSelect,
  } = useSearchState(initialPostcode);

  const [interestingApplications, setInterestingApplications] = useState<Application[]>([]);
  const [isLoadingInteresting, setIsLoadingInteresting] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialPostcode || initialLocation));
  const [shouldFetchInteresting, setShouldFetchInteresting] = useState(!hasSearched);
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { applications, isLoading: isLoadingApps } = useMapApplications(coordinates);

  const {
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
  } = useFilterSortState();

  const filteredApplications = useFilteredApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates
  );

  const statusCounts = {
    'Under Review': applications?.filter(app => 
      app.status?.toLowerCase().includes('under consideration'))?.length || 0,
    'Approved': applications?.filter(app => 
      app.status?.toLowerCase().includes('approved'))?.length || 0,
    'Declined': applications?.filter(app => 
      app.status?.toLowerCase().includes('declined'))?.length || 0,
    'Other': applications?.filter(app => {
      if (!app.status) return true;
      const status = status.toLowerCase();
      return !status.includes('under consideration') && 
             !status.includes('approved') && 
             !status.includes('declined');
    })?.length || 0
  };

  const fetchInterestingApplications = useCallback(async () => {
    if (!shouldFetchInteresting) {
      return;
    }

    console.log('🌟 Fetching interesting applications...');
    setIsLoadingInteresting(true);
    
    try {
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('*')
        .not('storybook', 'is', null)
        .order('id', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching interesting applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch interesting applications",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Fetched interesting applications:', data?.length);
      setInterestingApplications(data || []);
    } catch (error) {
      console.error('Failed to fetch interesting applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interesting applications",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInteresting(false);
    }
  }, [toast, shouldFetchInteresting]);

  useEffect(() => {
    if (shouldFetchInteresting && !hasSearched) {
      fetchInterestingApplications();
    }
  }, [shouldFetchInteresting, hasSearched, fetchInterestingApplications]);

  useEffect(() => {
    if (coordinates || applications?.length > 0) {
      setHasSearched(true);
      setShouldFetchInteresting(false);
    }
  }, [coordinates, applications]);

  const handleMarkerClick = (id: number | null) => {
    setSelectedId(id);
    if (id) {
      const element = document.getElementById(`application-${id}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLoading = isLoadingCoords || isLoadingApps || isLoadingInteresting;
  const displayApplications = hasSearched ? filteredApplications : interestingApplications;

  if (!isLoading && !displayApplications?.length && !coordinates) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <SearchSection
          onPostcodeSelect={handlePostcodeSelect}
          isMapView={false}
          applications={[]}
        />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-gray-600">No applications found. Try searching for a different location.</p>
        </div>
      </div>
    );
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
              {coordinates && (
                <FilterBar
                  onFilterChange={handleFilterChange}
                  onSortChange={handleSortChange}
                  activeFilters={activeFilters}
                  activeSort={activeSort}
                  applications={applications}
                  statusCounts={statusCounts}
                  isMapView={false}
                />
              )}
              {!coordinates && !isLoading && !hasSearched && (
                <div className="p-4 text-center w-full">
                  <h2 className="text-xl font-semibold text-primary">
                    Interesting Planning Applications Across the UK
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Search above to find planning applications in your area
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className={`${showMap ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
            <SearchResultsList 
              applications={displayApplications}
              isLoading={isLoading}
              onSeeOnMap={(id) => {
                setSelectedId(id);
                setShowMap(true);
              }}
            />
          </div>
          {showMap && coordinates && (
            <div className="w-1/2 relative">
              <div className="sticky top-4">
                <div className="relative h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => {
                      setShowMap(false);
                      setSelectedId(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <MapView 
                    applications={applications}
                    selectedId={selectedId}
                    coordinates={coordinates}
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResultsPage;
