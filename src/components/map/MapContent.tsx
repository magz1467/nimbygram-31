
import { MobileApplicationCards } from "./mobile/MobileApplicationCards";
import { MapContainer } from "./MapContainer";
import { Application } from "@/types/planning";
import { useEffect, useRef } from "react";
import { SortType } from "@/types/application-types";

interface MapContentProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  isMobile: boolean;
  isMapView: boolean;
  onMarkerClick: (id: number) => void;
  isLoading: boolean;
  postcode: string;
  activeSort?: SortType;
  activeFilters?: {
    status?: string;
    type?: string;
  };
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
  activeSort,
  activeFilters,
}: MapContentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  console.log('🗺️ MapContent rendering:', {
    isMobile, 
    hasSelectedId: !!selectedId,
    applicationCount: applications.length,
    coordinates,
    activeSort,
    activeFilters
  });

  // Force map to render correctly
  useEffect(() => {
    if (mapContainerRef.current) {
      console.log('🗺️ Triggering map container resize');
      
      // Force resize events to ensure map renders correctly
      const resizeEvents = [0, 100, 300, 500, 1000].map(delay => 
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          console.log(`🗺️ Dispatched resize event after ${delay}ms`);
        }, delay)
      );
      
      return () => {
        resizeEvents.forEach(clearTimeout);
      };
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
      
      {/* Mobile mini card - always show when an application is selected and on mobile */}
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
