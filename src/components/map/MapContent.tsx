
import { MobileApplicationCards } from "./mobile/MobileApplicationCards";
import { MapContainer } from "./MapContainer";
import { Application } from "@/types/planning";
import { useEffect, useRef, useState } from "react";

interface MapContentProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  searchLocation: [number, number]; // Search location prop
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
  searchLocation,
  isMobile,
  isMapView,
  onMarkerClick,
  isLoading,
  postcode,
}: MapContentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [forceRender, setForceRender] = useState(0);
  const [isMapLoading, setIsMapLoading] = useState(true);
  
  // Store the true search location to prevent it from being lost
  const effectiveSearchLocation = searchLocation || coordinates;
  
  // Log both locations to help debug
  useEffect(() => {
    console.log('🗺️ MapContent with search location:', effectiveSearchLocation);
    console.log('🗺️ MapContent with coordinates:', coordinates);
    console.log('🗺️ MapContent postcode:', postcode);
  }, [effectiveSearchLocation, coordinates, postcode]);

  // Force map to render correctly
  useEffect(() => {
    if (mapContainerRef.current) {
      console.log('🗺️ Triggering map container resize');
      setIsMapLoading(true);
      
      // Force resize events to ensure map renders correctly
      const resizeEvents = [0, 100, 300, 500, 1000].map(delay => 
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          console.log(`🗺️ Dispatched resize event after ${delay}ms`);
          
          // After the last resize event, set loading to false
          if (delay === 1000) {
            setIsMapLoading(false);
          }
        }, delay)
      );
      
      return () => {
        resizeEvents.forEach(clearTimeout);
      };
    }
  }, [effectiveSearchLocation, selectedId, isMobile]);

  // Listen for external requests to refresh the map
  useEffect(() => {
    const handleRefreshMarkers = () => {
      console.log('🔄 Forcing map markers refresh');
      setForceRender(prev => prev + 1);
      setIsMapLoading(true);
      
      // After a short delay, set loading to false
      setTimeout(() => {
        setIsMapLoading(false);
      }, 1000);
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
      setIsMapLoading(true);
      
      // After a short delay, set loading to false
      setTimeout(() => {
        setIsMapLoading(false);
      }, 800);
    }
  }, [isMobile, selectedId]);

  // Set loading to false after applications are loaded
  useEffect(() => {
    if (applications.length > 0) {
      // Short delay to ensure the map has time to process the applications
      setTimeout(() => {
        setIsMapLoading(false);
      }, 500);
    }
  }, [applications]);

  // Don't render if we don't have valid coordinates
  if (!effectiveSearchLocation || !coordinates) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" ref={mapContainerRef}>
      {/* Force render with key to ensure full component refresh when needed */}
      <MapContainer
        key={`map-${forceRender}-${isMobile ? 'mobile' : 'desktop'}-${selectedId || 'none'}`}
        applications={applications}
        selectedId={selectedId}
        coordinates={coordinates}
        searchLocation={effectiveSearchLocation} // Use effective search location
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
      
      {/* Show loading overlay when map is loading */}
      {(isLoading || isMapLoading) && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
