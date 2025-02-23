
import { useState } from "react";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { calculateDistance } from "@/utils/distance";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { useMapApplications } from "@/hooks/use-map-applications";

const MapViewPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [postcode, setPostcode] = useState("SW1A 1AA");
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates } = useCoordinates(postcode);
  const { applications, isLoading } = useMapApplications();

  // Filter applications by distance - increased radius to 20km and added detailed logging
  const filteredByDistance = applications.filter(app => {
    if (!coordinates || !app.coordinates) {
      console.log(`❌ Skipping application ${app.id} - Missing coordinates:`, {
        searchCoordinates: coordinates,
        appCoordinates: app.coordinates
      });
      return false;
    }
    
    const distance = calculateDistance(coordinates, app.coordinates);
    console.log(`📍 Application ${app.id} at ${app.address}:`, {
      distance,
      coordinates: app.coordinates,
      withinRadius: distance <= 20
    });
    
    return distance <= 20; // Increased from 10km to 20km for testing
  });

  // Use the filtered applications hook with distance-filtered applications
  const filteredApplications = useFilteredApplications(filteredByDistance, activeFilters, activeSort);

  // Default coordinates for central London
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

  const handlePostcodeSelect = (newPostcode: string) => {
    console.log('New postcode selected:', newPostcode);
    setPostcode(newPostcode);
  };

  console.log('🎯 MapContent rendering stats:', {
    rawApplicationCount: applications.length,
    filteredByDistanceCount: filteredByDistance.length,
    finalFilteredCount: filteredApplications.length,
    searchCoordinates: coordinates,
    activeFilters,
    searchPostcode: postcode,
    sampleApplications: filteredByDistance.slice(0, 3).map(app => ({
      id: app.id,
      coordinates: app.coordinates,
      title: app.title,
      address: app.address,
      distance: calculateDistance(coordinates || defaultCoordinates, app.coordinates || [0, 0])
    }))
  });

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
