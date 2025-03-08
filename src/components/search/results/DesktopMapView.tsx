
import { Application } from "@/types/planning";
import { MapContainer } from "@/components/map/MapContainer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  return (
    <div 
      className="col-span-1 relative rounded-lg overflow-hidden border shadow" 
      style={{ height: '700px' }}
    >
      <div className="absolute top-2 right-2 z-50 flex space-x-2">
        <Button 
          onClick={handleCloseMap}
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
