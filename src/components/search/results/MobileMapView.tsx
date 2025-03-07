
import { Application } from "@/types/planning";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { useEffect } from "react";

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
  
  // When mobile map view mounts, make sure body doesn't scroll and ensure visibility
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Force redraw of the map
    const timer = setTimeout(() => {
      const mapElement = document.querySelector('.mobile-map-container');
      if (mapElement) {
        console.log('📱 Forcing map container redraw');
        // Force a repaint to ensure map is visible
        mapElement.classList.add('force-redraw');
        setTimeout(() => mapElement.classList.remove('force-redraw'), 10);
      }
    }, 100);
    
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      className="mobile-map-container relative w-full h-full overflow-hidden shadow rounded-lg z-50"
      style={{ height: 'calc(100vh - 120px)' }}
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
