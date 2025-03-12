
import { Application } from "@/types/planning";
import { MapContent } from "@/components/map/MapContent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DesktopMapDialogProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  searchLocation: [number, number]; // Add search location coordinates
  handleMarkerClick: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  postcode?: string;
}

export const DesktopMapDialog = ({
  applications,
  selectedId,
  coordinates,
  searchLocation, // Add search location
  handleMarkerClick,
  isOpen,
  onClose,
  isLoading,
  postcode = "",
}: DesktopMapDialogProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && mapContainerRef.current) {
      console.log('🗺️ Desktop map dialog opened - forcing resize');
      
      // Force map to render correctly when dialog opens
      const resizeEvents = [50, 200, 500, 1000].map(delay => 
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          console.log(`🗺️ Dispatched resize event after ${delay}ms`);
        }, delay)
      );
      
      return () => resizeEvents.forEach(clearTimeout);
    }
  }, [isOpen]);

  console.log('📍 DesktopMapDialog rendering:', { 
    isOpen, 
    selectedId, 
    coordinatesProvided: !!coordinates,
    applicationCount: applications.length 
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[90vw] w-[900px] h-[80vh] p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="absolute top-2 right-2 z-50">
          <Button 
            onClick={onClose}
            className="bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow"
            size="icon"
            variant="outline"
            aria-label="Close map"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div ref={mapContainerRef} className="w-full h-full">
          {isOpen && (
            <MapContent 
              applications={applications}
              selectedId={selectedId}
              coordinates={searchLocation} // Use search location for map center
              searchLocation={searchLocation} // Pass search location to show blue pin
              isMobile={false}
              isMapView={true}
              onMarkerClick={handleMarkerClick}
              isLoading={isLoading}
              postcode={postcode}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
