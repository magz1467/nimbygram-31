
import { MapContainer } from "@/components/map/MapContainer";
import { Application } from "@/types/planning";
import { memo } from "react";

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
  // Use the correct API key and ensure the correct coordinates are passed
  console.log("MapView rendering with coordinates:", coordinates);
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        searchLocation={coordinates} // Added searchLocation prop
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
