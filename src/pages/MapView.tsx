
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
  console.log('📍 MapView initial location state:', location.state);
  
  const [postcode, setPostcode] = useState(() => {
    const initialPostcode = location.state?.postcode || "SW1A 1AA";
    console.log('🏠 Setting initial postcode:', initialPostcode);
    return initialPostcode;
  });
  
  const [isSearching, setIsSearching] = useState(!!location.state?.postcode);
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates, isLoading: isLoadingCoordinates } = useCoordinates(postcode);
  const { applications, isLoading: isLoadingApplications } = useMapApplications(coordinates);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Listen for search start events
  useEffect(() => {
    console.log('🎯 Setting up searchStarted event listener');
    const handleSearchStart = () => {
      console.log('🔄 Search started event received');
      setIsSearching(true);
    };

    window.addEventListener('searchStarted', handleSearchStart);
    return () => {
      window.removeEventListener('searchStarted', handleSearchStart);
    };
  }, []);

  // Listen for postcode search events
  useEffect(() => {
    console.log('📬 Setting up postcodeSearch event listener');
    const handlePostcodeSearch = (event: CustomEvent<{ postcode: string }>) => {
      const newPostcode = event.detail.postcode;
      console.log('📨 Received postcodeSearch event:', newPostcode);
      console.log('Current postcode:', postcode);
      setPostcode(newPostcode);
    };

    window.addEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    return () => {
      window.removeEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    };
  }, []);

  // Reset search state when loading is complete
  useEffect(() => {
    if (!isLoadingCoordinates && !isLoadingApplications && isSearching) {
      console.log('✅ Loading complete, resetting search state');
      setIsSearching(false);
    }
  }, [isLoadingCoordinates, isLoadingApplications, isSearching]);

  // Reset selected application when postcode changes
  useEffect(() => {
    console.log('🔄 Postcode changed, resetting selected application');
    setSelectedId(null);
  }, [postcode]);

  const filteredApplications = useFilteredApplications(applications, activeFilters, activeSort, coordinates);
  const defaultCoordinates: [number, number] = coordinates || [51.5074, -0.1278];

  const handlePostcodeSelect = (newPostcode: string) => {
    console.log('📍 New postcode selected:', newPostcode);
    setPostcode(newPostcode);
    setIsSearching(true);
  };

  console.log('🎯 MapView rendering with:', {
    postcode,
    coordinates,
    isSearching,
    isLoadingCoordinates,
    isLoadingApplications,
    applicationCount: applications.length,
    filteredCount: filteredApplications.length
  });

  const isLoading = isLoadingCoordinates || isLoadingApplications || isSearching;

  return (
    <MapViewLayout
      applications={filteredApplications}
      selectedId={selectedId}
      postcode={postcode}
      coordinates={defaultCoordinates}
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
