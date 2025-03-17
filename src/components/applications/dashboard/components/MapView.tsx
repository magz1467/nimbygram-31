
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
  // Make sure we have valid coordinates
  const validCoordinates: [number, number] = Array.isArray(coordinates) && 
    coordinates.length === 2 && 
    !isNaN(coordinates[0]) && 
    !isNaN(coordinates[1]) ? 
    coordinates : [51.5074, -0.1278]; // Default to London only if invalid
  
  // Log coordinates for debugging
  useEffect(() => {
    console.log("🗺️ MapView rendering with coordinates:", validCoordinates);
  }, [validCoordinates]);
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={validCoordinates}
        searchLocation={validCoordinates} // Always use the same coordinates for search location
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
