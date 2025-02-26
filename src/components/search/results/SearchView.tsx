
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { useSearchState } from "@/hooks/applications/use-search-state";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { FilterBar } from "@/components/FilterBar";
import { ResultsContainer } from "./ResultsContainer";
import { useLocation } from "react-router-dom";
import { useStatusCounts } from "@/hooks/applications/use-status-counts";
import { useInterestingApplications } from "@/hooks/applications/use-interesting-applications";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/distance";

export const SearchView = () => {
  const location = useLocation();
  const initialPostcode = location.state?.searchType === 'postcode' ? location.state.searchTerm : '';

  const {
    postcode,
    coordinates,
    isLoadingCoords,
    isLoadingApps,
    applications = [],
    handlePostcodeSelect,
  } = useSearchState(initialPostcode);

  const [hasSearched, setHasSearched] = useState(Boolean(initialPostcode));
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
  } = useFilterSortState();

  // Move filtering logic here instead of using a separate hook
  const filteredApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      if (activeFilters.status && app.status !== activeFilters.status) {
        return false;
      }
      // Add other filter conditions as needed
      return true;
    });

    // Sort applications
    return filtered.sort((a, b) => {
      if (activeSort === 'newest') {
        return new Date(b.submissionDate || '').getTime() - new Date(a.submissionDate || '').getTime();
      }
      if (activeSort === 'closest' && coordinates) {
        const distanceA = a.coordinates ? calculateDistance(coordinates, a.coordinates) : Infinity;
        const distanceB = b.coordinates ? calculateDistance(coordinates, b.coordinates) : Infinity;
        return distanceA - distanceB;
      }
      return 0;
    });
  }, [applications, activeFilters, activeSort, coordinates]);

  const statusCounts = useStatusCounts(applications);

  const { 
    interestingApplications, 
    isLoadingInteresting,
    fetchInterestingApplications 
  } = useInterestingApplications(hasSearched);

  useEffect(() => {
    if (!hasSearched) {
      fetchInterestingApplications();
    }
  }, [hasSearched, fetchInterestingApplications]);

  useEffect(() => {
    if (coordinates || applications?.length > 0) {
      setHasSearched(true);
    }
  }, [coordinates, applications]);

  const handleMarkerClick = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id) {
      const element = document.getElementById(`application-${id}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const isLoading = isLoadingCoords || isLoadingApps || isLoadingInteresting;
  const displayApplications = hasSearched ? filteredApplications : interestingApplications;

  console.log('🔄 SearchView render:', {
    hasSearched,
    hasCoordinates: !!coordinates,
    applicationsCount: applications.length,
    isLoading,
    displayApplicationsCount: displayApplications?.length
  });

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
      />
    </div>
  );
};
