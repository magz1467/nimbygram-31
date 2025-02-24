
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { calculateDistance } from "@/utils/distance";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { useMapApplications } from "@/hooks/use-map-applications";

const MapViewPage = () => {
  console.log('🔄 MapView component mounting');
  
  const location = useLocation();
  console.log('📍 MapView initial location state:', location.state);
  
  const [postcode, setPostcode] = useState<string>(() => {
    const locationPostcode = location.state?.postcode;
    console.log('🏠 Initial postcode from location:', locationPostcode);
    if (!locationPostcode) {
      console.log('⚠️ No postcode in location state, using default SW1A 1AA');
      return "SW1A 1AA";
    }
    console.log('✅ Using postcode from location state:', locationPostcode);
    return locationPostcode;
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  
  console.log('🌍 Before useCoordinates hook, postcode:', postcode);
  const { coordinates, isLoading: isLoadingCoordinates } = useCoordinates(postcode);
  console.log('📌 After useCoordinates hook:', { coordinates, isLoadingCoordinates });
  
  const { applications, isLoading: isLoadingApplications } = useMapApplications(coordinates);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Track mount/unmount for debugging
  useEffect(() => {
    console.log('🎯 MapView mounted with initial postcode:', postcode);
    return () => {
      console.log('👋 MapView unmounting');
    };
  }, []);

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

  // Listen for postcode search events with more detailed logging
  useEffect(() => {
    console.log('📬 Setting up postcodeSearch event listener, current postcode:', postcode);
    
    const handlePostcodeSearch = (event: CustomEvent<{ postcode: string }>) => {
      const newPostcode = event.detail.postcode;
      console.log('📨 Received postcodeSearch event:', newPostcode);
      console.log('Current postcode state before update:', postcode);
      
      if (newPostcode) {
        console.log('🔄 Updating postcode to:', newPostcode);
        setPostcode(newPostcode);
        setIsSearching(true);
      }
    };

    window.addEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    return () => {
      console.log('🔇 Removing postcodeSearch event listener');
      window.removeEventListener('postcodeSearch', handlePostcodeSearch as EventListener);
    };
  }, []); // Removed postcode from dependencies to prevent re-subscriptions

  // Reset search state when loading is complete
  useEffect(() => {
    console.log('🔍 Loading state check:', {
      isLoadingCoordinates,
      isLoadingApplications,
      isSearching,
      postcode,
      coordinates
    });
    
    if (!isLoadingCoordinates && !isLoadingApplications && isSearching) {
      console.log('✅ Loading complete, resetting search state');
      setIsSearching(false);
    }
  }, [isLoadingCoordinates, isLoadingApplications, isSearching]);

  // Reset selected application when postcode changes
  useEffect(() => {
    console.log('🔄 Postcode changed to:', postcode);
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
