
import { Application } from "@/types/planning";
import { MapContainer as MapContainerBase } from "../../MapContainer";
import { MobileApplicationCards } from "../../mobile/MobileApplicationCards";

interface MapContainerProps {
  isMobile: boolean;
  isMapView: boolean;
  coordinates: [number, number];
  applications: Application[];
  selectedApplication: number | null;
  onMarkerClick: (id: number | null) => void;
  postcode: string;
}

export const MapContainer = ({
  isMobile,
  isMapView,
  coordinates,
  applications,
  selectedApplication,
  onMarkerClick,
  postcode,
}: MapContainerProps) => {
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
        <MapContainerBase
          coordinates={coordinates}
          searchLocation={coordinates} // Add searchLocation prop
          applications={applications}
          selectedId={selectedApplication}
          onMarkerClick={onMarkerClick}
        />
        {isMobile && isMapView && selectedApplication !== null && (
          <MobileApplicationCards
            applications={applications}
            selectedId={selectedApplication}
            onSelectApplication={onMarkerClick}
            postcode={postcode}
          />
        )}
      </div>
    </div>
  );
};
