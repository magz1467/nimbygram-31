
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
  return (
    <div className="absolute inset-0">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        onMarkerClick={onMarkerClick}
        onCenterChange={onCenterChange}
      />
    </div>
  );
});

MapView.displayName = 'MapView';
