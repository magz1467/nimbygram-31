
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
  const searchPostcode = location.state?.postcode || "SW1A 1AA";
  const [postcode, setPostcode] = useState(searchPostcode);
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates, isLoading: isLoadingCoordinates } = useCoordinates(postcode);
  const { applications, isLoading: isLoadingApplications } = useMapApplications(coordinates);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Reset selected application when postcode changes
  useEffect(() => {
    setSelectedId(null);
  }, [postcode]);

  // Use the filtered applications hook with applications
  const filteredApplications = useFilteredApplications(applications, activeFilters, activeSort);

  // Default coordinates for central London if none provided
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

  const handlePostcodeSelect = (newPostcode: string) => {
    console.log('New postcode selected:', newPostcode);
    setPostcode(newPostcode);
  };

  console.log('🎯 MapContent rendering stats:', {
    rawApplicationCount: applications.length,
    finalFilteredCount: filteredApplications.length,
    searchCoordinates: coordinates,
    activeFilters,
    searchPostcode: postcode,
    sampleApplications: applications.slice(0, 3).map(app => ({
      id: app.id,
      coordinates: app.coordinates,
      title: app.title,
      address: app.address,
      distance: coordinates ? calculateDistance(coordinates, app.coordinates || [0, 0]) : 0
    }))
  });

  return (
    <MapViewLayout
      applications={filteredApplications}
      selectedId={selectedId}
      postcode={postcode}
      coordinates={coordinates || defaultCoordinates}
      isLoading={isLoadingCoordinates || isLoadingApplications}
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

