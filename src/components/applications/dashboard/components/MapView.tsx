
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
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        searchLocation={coordinates} // Always use the same coordinates for search location
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
