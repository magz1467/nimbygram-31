
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
  
  // Make sure we have valid coordinates before rendering
  if (!coordinates || 
      !Array.isArray(coordinates) || 
      coordinates.length !== 2 || 
      !isFinite(coordinates[0]) || 
      !isFinite(coordinates[1]) ||
      coordinates[0] === 0 || 
      coordinates[1] === 0) {
    console.warn("MapView - Invalid coordinates, not rendering map:", coordinates);
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-primary">Loading map location...</span>
      </div>
    );
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
