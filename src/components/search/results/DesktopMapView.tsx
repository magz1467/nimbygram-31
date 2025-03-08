
import { Application } from "@/types/planning";
import { MapContainer } from "@/components/map/MapContainer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface DesktopMapViewProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  handleMarkerClick: (id: number) => void;
  handleCloseMap: () => void;
  isLoading: boolean;
}

export const DesktopMapView = ({
  applications,
  selectedId,
  coordinates,
  handleMarkerClick,
  handleCloseMap,
  isLoading,
}: DesktopMapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Force map to render correctly when it becomes visible
  useEffect(() => {
    if (mapContainerRef.current) {
      console.log('🗺️ Desktop map mounted - forcing resize');
      
      // Allow the component to mount before triggering resize events
      const resizeEvents = [50, 200, 500, 1000].map(delay => 
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          console.log(`🗺️ Dispatched resize event after ${delay}ms`);
        }, delay)
      );
      
      return () => {
        resizeEvents.forEach(clearTimeout);
      };
    }
  }, []);
  
  console.log('🗺️ DesktopMapView rendering with selectedId:', selectedId);
  
  return (
    <div 
      className="col-span-1 relative rounded-lg overflow-hidden border shadow" 
      style={{ height: '700px', display: 'block' }}
      ref={mapContainerRef}
    >
      <div className="absolute top-2 right-2 z-50 flex space-x-2">
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseMap();
          }}
          className="bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow"
          size="icon"
          variant="outline"
          aria-label="Close map"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="w-full h-full">
        <MapContainer
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
};
