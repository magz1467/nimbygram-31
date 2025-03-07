
import { MobileApplicationCards } from "./mobile/MobileApplicationCards";
import { MapContainer } from "./MapContainer";
import { Application } from "@/types/planning";
import { useEffect, useRef } from "react";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  console.log('🗺️ MapContent rendering:', {
    isMobile, 
    hasSelectedId: !!selectedId,
    applicationCount: applications.length,
    coordinates
  });

  // Force map to render correctly
  useEffect(() => {
    if (mapContainerRef.current) {
      console.log('🗺️ Triggering map container resize');
      
      // Force resize event to ensure map renders correctly
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Force a repaint of the map container
      const forceRepaint = () => {
        if (mapContainerRef.current) {
          const display = mapContainerRef.current.style.display;
          mapContainerRef.current.style.display = 'none';
          // Force reflow
          void mapContainerRef.current.offsetHeight;
          mapContainerRef.current.style.display = display;
        }
      };
      
      // Delay to ensure DOM has updated
      setTimeout(forceRepaint, 100);
    }
  }, [coordinates, selectedId, isMobile]);

  return (
    <div className="relative w-full h-full" ref={mapContainerRef}>
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
