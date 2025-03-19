import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useApplicationSorting } from "@/hooks/use-application-sorting";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { useMapApplications } from "@/hooks/use-map-applications";

const MapViewPage = () => {
  const location = useLocation();
  
  const [postcode, setPostcode] = useState<string>(() => {
    const locationPostcode = location.state?.postcode;
    return locationPostcode || "SW1A 1AA";
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const { activeFilters, activeSort, showMap, handleFilterChange, handleSortChange } = useFilterSortState();
  
  const { coordinates, isLoading: isLoadingCoordinates } = useCoordinates(postcode);
  const { applications, isLoading: isLoadingApplications } = useMapApplications(coordinates);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Handle postcode updates
  const handlePostcodeUpdate = useCallback((newPostcode: string) => {
    if (newPostcode !== postcode) {
      setPostcode(newPostcode);
      setIsSearching(true);
      setSelectedId(null);
    }
  }, [postcode]);

  // Reset search state when loading is complete
  useEffect(() => {
    if (!isLoadingCoordinates && !isLoadingApplications && isSearching) {
      setIsSearching(false);
    }
  }, [isLoadingCoordinates, isLoadingApplications, isSearching]);

  // Apply filters
  const filteredApplications = applications.filter(app => {
    if (activeFilters.status && !app.status?.toLowerCase().includes(activeFilters.status.toLowerCase())) {
      return false;
    }
    if (activeFilters.type && 
        !app.type?.toLowerCase().includes(activeFilters.type.toLowerCase()) &&
        !app.type?.toLowerCase().includes(activeFilters.type.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Apply sorting
  const sortedApplications = useApplicationSorting(
    filteredApplications, 
    activeSort, 
    coordinates
  );

  const handlePostcodeSelect = (newPostcode: string) => {
    handlePostcodeUpdate(newPostcode);
  };

  const isLoading = isLoadingCoordinates || isLoadingApplications || isSearching;

  return (
    <MapViewLayout
      applications={sortedApplications}
      selectedId={selectedId}
      postcode={postcode}
      coordinates={coordinates || [51.5074, -0.1278]} // Fallback coordinates
      isLoading={isLoading}
      activeFilters={activeFilters}
      activeSort={activeSort}
      onPostcodeSelect={handlePostcodeSelect}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onMarkerClick={(id) => {
        setSelectedId(id);
      }}
      onSelectApplication={setSelectedId}
    />
  );
};

export default MapViewPage;
