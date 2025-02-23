
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

  // Filter applications by distance - increased radius to 10km
  const filteredByDistance = applications.filter(app => {
    if (!coordinates || !app.coordinates) {
      console.log('Skipping application due to missing coordinates:', app.id);
      return false;
    }
    const distance = calculateDistance(coordinates, app.coordinates);
    console.log('Application distance:', { id: app.id, distance, coordinates: app.coordinates });
    return distance <= 10; // Increased from 3km to 10km
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
    sampleApplications: filteredByDistance.slice(0, 3).map(app => ({
      id: app.id,
      coordinates: app.coordinates,
      title: app.title
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

