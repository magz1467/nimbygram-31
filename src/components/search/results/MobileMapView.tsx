
import { Application } from "@/types/planning";
import { MapContent } from "@/components/map/MapContent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface MobileMapViewProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  handleMarkerClick: (id: number) => void;
  handleCloseMap: () => void;
  isLoading: boolean;
  postcode: string;
}

export const MobileMapView = ({
  applications,
  selectedId,
  coordinates,
  handleMarkerClick,
  handleCloseMap,
  isLoading,
  postcode,
}: MobileMapViewProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // When mobile map view mounts, prevent body scrolling
  useEffect(() => {
    console.log('📱 Mobile map overlay mounted');
    document.body.style.overflow = 'hidden';
    
    // Force redraw of the map
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        console.log('📱 Forcing map container redraw');
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);
    
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-white z-[9999]"
      ref={overlayRef}
    >
      <div className="absolute top-4 right-4 z-[10000]">
        <Button 
          onClick={handleCloseMap}
          className="bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow-md"
          size="icon"
          variant="outline"
          aria-label="Close map"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="w-full h-full">
        <MapContent 
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          isMobile={true}
          isMapView={true}
          onMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          postcode={postcode}
        />
      </div>
    </div>
  );
};
