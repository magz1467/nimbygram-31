
import { MapContainer } from "@/components/map/MapContainer";
import { Application } from "@/types/planning";
import { memo, useEffect } from "react";

interface MapViewProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  onMarkerClick: (id: number | null) => void;
  onCenterChange?: (center: [number, number]) => void;
}

export const MapView = memo(({
  applications,
  selectedId,
  coordinates,
  onMarkerClick,
  onCenterChange,
}: MapViewProps) => {
  // Log coordinates for debugging
  useEffect(() => {
    console.log("🗺️ MapView rendering with coordinates:", coordinates);
  }, [coordinates]);
  
  // Don't render the map if coordinates aren't available
  if (!coordinates || coordinates[0] === 0 || coordinates[1] === 0) {
    console.warn("MapView - Invalid coordinates, not rendering map:", coordinates);
    return <div className="flex h-full w-full items-center justify-center">Loading map location...</div>;
  }
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        searchLocation={coordinates} // Always use coordinates for search location
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
