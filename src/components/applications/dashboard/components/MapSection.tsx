
import { Application } from "@/types/planning";
import { MapView } from "./MapView";
import { MobileApplicationCards } from "@/components/map/mobile/MobileApplicationCards";
import { useCallback, memo } from "react";

interface MapSectionProps {
  isMobile: boolean;
  isMapView: boolean;
  coordinates: [number, number] | null;
  applications: Application[];
  selectedId: number | null;
  dispatch: { 
    type: string;
    payload: (id: number) => void;
  };
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
  const handleMarkerClick = useCallback((id: number | null) => {
    console.log('MapSection handleMarkerClick:', id);
    if (id !== null && dispatch && typeof dispatch.payload === 'function') {
      dispatch.payload(id);
    }
  }, [dispatch]);

  // Don't render if no coordinates or map is not visible
  if (!coordinates || (!isMobile && !isMapView)) return null;

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
          coordinates={coordinates}
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
