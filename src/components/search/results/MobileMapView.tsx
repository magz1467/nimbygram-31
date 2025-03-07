
import { Application } from "@/types/planning";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

interface MobileMapViewProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  handleMarkerClick: (id: number) => void;
  handleCloseMap: () => void;
  isLoading: boolean;
}

export const MobileMapView = ({
  applications,
  selectedId,
  coordinates,
  handleMarkerClick,
  handleCloseMap,
  isLoading,
}: MobileMapViewProps) => {
  return (
    <div 
      className="mobile-map-container relative w-full overflow-hidden shadow rounded-lg"
      style={{ height: 'calc(100vh - 120px)', width: '100%' }}
    >
      <div className="absolute top-2 left-2 right-2 z-50 flex justify-between">
        <Button 
          onClick={handleCloseMap}
          className="bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow"
          size="icon"
          variant="outline"
          aria-label="Back to results"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
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
