import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { useSearchState } from "@/hooks/applications/use-search-state";
import { useMapApplications } from "@/hooks/use-map-applications";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { FilterBar } from "@/components/FilterBar";
import { useEffect, useState } from "react";
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const initialPostcode = location.state?.postcode;

  const {
    postcode,
    coordinates,
    isLoadingCoords,
    handlePostcodeSelect,
  } = useSearchState(initialPostcode);

  const [interestingApplications, setInterestingApplications] = useState<Application[]>([]);
  const [isLoadingInteresting, setIsLoadingInteresting] = useState(true);

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

  useEffect(() => {
    const fetchInterestingApplications = async () => {
      console.log('🌟 Fetching interesting applications...');
      setIsLoadingInteresting(true);
      
      try {
        const { data, error } = await supabase
          .from('crystal_roof')
          .select('*')
          .not('storybook', 'is', null)  // Only get applications with storybook content
          .order('id', { ascending: false })  // Get newest first
          .limit(10);  // Limit to 10 interesting applications

        if (error) {
          console.error('Error fetching interesting applications:', error);
          return;
        }

        console.log('📊 Fetched interesting applications:', data?.length);
        setInterestingApplications(data || []);
      } catch (error) {
        console.error('Failed to fetch interesting applications:', error);
      } finally {
        setIsLoadingInteresting(false);
      }
    };

    // Only fetch interesting applications if no search has been made
    if (!coordinates && !applications?.length) {
      fetchInterestingApplications();
    }
  }, [coordinates, applications]);

  const isLoading = isLoadingCoords || isLoadingApps || isLoadingInteresting;

  // Determine which applications to show
  const displayApplications = coordinates ? filteredApplications : interestingApplications;

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
              {!coordinates && !isLoading && (
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
        <SearchResultsList 
          applications={displayApplications}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default SearchResultsPage;
