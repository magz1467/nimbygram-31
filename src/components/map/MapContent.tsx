
import { MobileApplicationCards } from "./mobile/MobileApplicationCards";
import { MapContainer } from "./MapContainer";
import { Application } from "@/types/planning";
import { useEffect, useRef, useState } from "react";

interface MapContentProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  searchLocation: [number, number]; // Added searchLocation prop
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
  searchLocation, // Added searchLocation to props
  isMobile,
  isMapView,
  onMarkerClick,
  isLoading,
  postcode,
}: MapContentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [forceRender, setForceRender] = useState(0);
  
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

  // Listen for external requests to refresh the map
  useEffect(() => {
    const handleRefreshMarkers = () => {
      console.log('🔄 Forcing map markers refresh');
      setForceRender(prev => prev + 1);
    };

    window.addEventListener('refresh-map-markers', handleRefreshMarkers);
    
    return () => {
      window.removeEventListener('refresh-map-markers', handleRefreshMarkers);
    };
  }, []);

  // Force re-render when mobile or selected ID changes
  useEffect(() => {
    if (isMobile) {
      console.log('📱 Mobile view detected, forcing marker refresh');
      setForceRender(prev => prev + 1);
    }
  }, [isMobile, selectedId]);

  return (
    <div className="relative w-full h-full" ref={mapContainerRef}>
      {/* Force render with key to ensure full component refresh when needed */}
      <MapContainer
        key={`map-${forceRender}-${isMobile ? 'mobile' : 'desktop'}-${selectedId || 'none'}`}
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        searchLocation={searchLocation} // Pass searchLocation
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
