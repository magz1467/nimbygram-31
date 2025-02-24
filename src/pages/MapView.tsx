
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { calculateDistance } from "@/utils/distance";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { useMapApplications } from "@/hooks/use-map-applications";

const MapViewPage = () => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(location.state?.postcode || "SW1A 1AA");
  const [isSearching, setIsSearching] = useState(location.state?.postcode ? true : false);
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates, isLoading: isLoadingCoordinates } = useCoordinates(postcode);
  const { applications, isLoading: isLoadingApplications } = useMapApplications(coordinates);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Listen for search start events
  useEffect(() => {
    console.log('Setting up searchStarted event listener');
    const handleSearchStart = () => {
      console.log('Search started event received, setting isSearching to true');
      setIsSearching(true);
    };

    window.addEventListener('searchStarted', handleSearchStart);
    return () => {
      window.removeEventListener('searchStarted', handleSearchStart);
    };
  }, []);

  // Listen for postcode search events
  useEffect(() => {
    console.log('Setting up postcodeSearch event listener');
    const handlePostcodeSearch = (event: CustomEvent<{ postcode: string }>) => {
      console.log('Received postcode search event:', event.detail.postcode);
      setPostcode(event.detail.postcode);
    };

    window.addEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    return () => {
      window.removeEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    };
  }, []);

  // Reset search state when loading is complete
  useEffect(() => {
    if (!isLoadingCoordinates && !isLoadingApplications && isSearching) {
      console.log('Loading complete, resetting search state');
      setIsSearching(false);
    }
  }, [isLoadingCoordinates, isLoadingApplications, isSearching]);

  // Reset selected application when postcode changes
  useEffect(() => {
    setSelectedId(null);
  }, [postcode]);

  const filteredApplications = useFilteredApplications(applications, activeFilters, activeSort, coordinates);
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

  const handlePostcodeSelect = (newPostcode: string) => {
    console.log('New postcode selected:', newPostcode);
    setPostcode(newPostcode);
    setIsSearching(true);
  };

  console.log('🎯 MapContent rendering stats:', {
    rawApplicationCount: applications.length,
    finalFilteredCount: filteredApplications.length,
    searchCoordinates: coordinates,
    activeFilters,
    searchPostcode: postcode,
    isLoading: isLoadingCoordinates || isLoadingApplications || isSearching,
    sampleApplications: applications.slice(0, 3).map(app => ({
      id: app.id,
      coordinates: app.coordinates,
      title: app.title,
      address: app.address,
      distance: coordinates ? calculateDistance(coordinates, app.coordinates || [0, 0]) : 0
    }))
  });

  const isLoading = isLoadingCoordinates || isLoadingApplications || isSearching;
  console.log('Loading state:', { isLoadingCoordinates, isLoadingApplications, isSearching, isLoading });

  return (
    <MapViewLayout
      applications={filteredApplications}
      selectedId={selectedId}
      postcode={postcode}
      coordinates={coordinates || defaultCoordinates}
      isLoading={isLoading}
      activeFilters={activeFilters}
      activeSort={activeSort}
      onPostcodeSelect={handlePostcodeSelect}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onMarkerClick={(id) => {
        console.log('🖱️ Marker clicked:', id);
        setSelectedId(id);
      }}
      onSelectApplication={setSelectedId}
    />
  );
};

export default MapViewPage;
