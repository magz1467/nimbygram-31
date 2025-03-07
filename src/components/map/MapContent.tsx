
import { MobileApplicationCards } from "./mobile/MobileApplicationCards";
import { MapContainer } from "./MapContainer";
import { Application } from "@/types/planning";

interface MapContentProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  isMobile: boolean;
  isMapView: boolean;
  onMarkerClick: (id: number) => void;
  isLoading: boolean;
  postcode: string;
}

export const MapContent = ({
  applications,
  selectedId,
  coordinates,
  isMobile,
  isMapView,
  onMarkerClick,
  isLoading,
  postcode,
}: MapContentProps) => {
  console.log('🗺️ MapContent rendering:', {
    isMobile, 
    hasSelectedId: !!selectedId,
    applicationCount: applications.length,
    coordinates
  });

  return (
    <div className="relative w-full h-full">
      <MapContainer
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        onMarkerClick={onMarkerClick}
      />
      
      {/* Mobile mini card - only show when an application is selected */}
      {isMobile && selectedId && (
        <MobileApplicationCards
          applications={applications}
          selectedId={selectedId}
          onSelectApplication={onMarkerClick}
          postcode={postcode}
        />
      )}
    </div>
  );
};
