
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
  // This is CRITICAL - we must ensure we're not defaulting to London when we have valid coordinates
  const validCoordinates: [number, number] = Array.isArray(coordinates) && 
    coordinates.length === 2 && 
    !isNaN(coordinates[0]) && 
    !isNaN(coordinates[1]) && 
    Math.abs(coordinates[0]) <= 90 && 
    Math.abs(coordinates[1]) <= 180 ? 
    [coordinates[0], coordinates[1]] : [52.4068, -1.5197]; // Default to Coventry instead of London
  
  // Log coordinates for debugging
  useEffect(() => {
    console.log("🗺️ MapView rendering with coordinates:", validCoordinates);
    console.log("🗺️ Original coordinates passed:", coordinates);
  }, [validCoordinates, coordinates]);
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={validCoordinates}
        searchLocation={validCoordinates} // Always use the same valid coordinates for search location
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
