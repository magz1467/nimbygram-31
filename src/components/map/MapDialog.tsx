
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Application } from "@/types/planning";
import { MapContainer } from "@/components/map/MapContainer";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  allApplications?: Application[];
  searchCoordinates?: [number, number]; // Added search coordinates prop
}

export const MapDialog = ({
  isOpen,
  onClose,
  application,
  allApplications = [],
  searchCoordinates // Use this for the blue dot location
}: MapDialogProps) => {
  // If no coordinates are available for the application, we can't show the map
  if (!application.coordinates) {
    return null;
  }

  // Filter nearby applications (excluding the current one)
  const nearbyApplications = allApplications.filter(app => 
    app.id !== application.id && app.coordinates
  );

  // Combine current application with nearby ones
  const mapApplications = [application, ...nearbyApplications];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] sm:max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-[500px] w-full">
          <Button 
            className="absolute top-2 right-2 z-[1000]" 
            size="icon" 
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <MapContainer
            applications={mapApplications}
            selectedId={application.id}
            coordinates={application.coordinates} // Center map on application
            searchLocation={searchCoordinates || application.coordinates} // Use search coordinates for blue dot if available
            onMarkerClick={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
