import { Application } from "@/types/planning";
import { MapView } from "./MapView";
import { MobileApplicationCards } from "@/components/map/mobile/MobileApplicationCards";
import { useCallback, memo, useEffect, useState } from "react";
import { MapAction } from "@/types/map-reducer";
import { EmptyStateWithEmail } from "./EmptyStateWithEmail";

interface MapSectionProps {
  isMobile: boolean;
  isMapView: boolean;
  coordinates: [number, number] | null;
  applications: Application[];
  selectedId: number | null;
  dispatch: React.Dispatch<MapAction>;
  postcode: string;
}

export const MapSection = memo(({
  isMobile,
  isMapView,
  coordinates,
  applications,
  selectedId,
  dispatch,
  postcode,
}: MapSectionProps) => {
  // Keep track of last valid coordinates to avoid losing them
  const [lastValidCoordinates, setLastValidCoordinates] = useState<[number, number] | null>(null);
  
  // Update last valid coordinates when we receive new valid ones
  useEffect(() => {
    if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
      setLastValidCoordinates(coordinates);
      console.log('MapSection: Stored valid coordinates:', coordinates);
    }
  }, [coordinates]);
  
  // Use last valid coordinates as a fallback
  const effectiveCoordinates = coordinates || lastValidCoordinates;
  
  const handleMarkerClick = useCallback((id: number | null) => {
    console.log('MapSection handleMarkerClick:', id);
    dispatch({ type: 'SELECT_APPLICATION', payload: id });
  }, [dispatch]);

  if (!effectiveCoordinates || (!isMobile && !isMapView)) return null;

  // Show empty state if no applications and coordinates are valid
  if (applications.length === 0) {
    return (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <EmptyStateWithEmail postcode={postcode} />
      </div>
    );
  }

  return (
    <div 
      className="flex-1 relative"
      style={{ 
        height: isMobile ? 'calc(100vh - 120px)' : '100%',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div className="absolute inset-0">
        <MapView
          applications={applications}
          selectedId={selectedId}
          coordinates={effectiveCoordinates}
          onMarkerClick={handleMarkerClick}
        />
        {isMobile && selectedId && (
          <MobileApplicationCards
            applications={applications}
            selectedId={selectedId}
            onSelectApplication={handleMarkerClick}
            postcode={postcode}
          />
        )}
      </div>
    </div>
  );
});

MapSection.displayName = 'MapSection';
