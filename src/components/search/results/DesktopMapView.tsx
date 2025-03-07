
import { Application } from "@/types/planning";
import { MapViewLayout } from "@/components/map/MapViewLayout";
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
      
      <MapViewLayout 
        applications={applications}
        selectedId={selectedId}
        postcode=""
        coordinates={coordinates}
        isLoading={isLoading}
        activeFilters={{}}
        activeSort={null}
        onPostcodeSelect={() => {}}
        onFilterChange={() => {}}
        onSortChange={() => {}}
        onMarkerClick={handleMarkerClick}
        onSelectApplication={handleMarkerClick}
      />
    </div>
  );
};
