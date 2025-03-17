
import { Application } from "@/types/planning";
import { MapContent } from "@/components/map/MapContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SearchResultCard } from "@/components/search/SearchResultCard";

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
  const [showFullCard, setShowFullCard] = useState(false);
  
  // When mobile map view mounts, prevent body scrolling
  useEffect(() => {
    console.log('📱 Mobile map overlay mounted with z-index: 50');
    document.body.style.overflow = 'hidden';
    
    // Force redraw of the map
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        console.log('📱 Forcing map container redraw');
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);
    
    // Force a refresh of the map component to ensure markers are rendered
    const refreshTimer = setTimeout(() => {
      console.log('📱 Refreshing map to ensure markers are visible');
      const event = new CustomEvent('refresh-map-markers', {
        detail: { applications, selectedId }
      });
      window.dispatchEvent(event);
    }, 500);
    
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
      clearTimeout(refreshTimer);
    };
  }, [applications, selectedId]);

  // Get the selected application
  const selectedApplication = applications.find(app => app.id === selectedId);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white overflow-hidden flex flex-col"
      ref={overlayRef}
    >
      {/* Header with back button */}
      <div className="bg-white p-4 shadow-sm z-[10000] flex items-center justify-between">
        <Button 
          onClick={handleCloseMap}
          variant="ghost"
          className="flex items-center gap-2 text-gray-800"
          size="sm"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to list
        </Button>
        
        <div className="text-sm font-medium">
          {selectedId ? 'Application Details' : 'Map View'}
        </div>
        
        <Button 
          onClick={handleCloseMap}
          className="text-gray-800 p-1 h-8 w-8"
          size="icon"
          variant="ghost"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Map container */}
      <div className="w-full flex-1 relative">
        <MapContent 
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          searchLocation={coordinates}
          isMobile={true}
          isMapView={true}
          onMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          postcode={postcode}
        />
      </div>
      
      {/* Selected application card (slides up from bottom) */}
      {selectedId && selectedApplication && (
        <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl max-h-[80vh] overflow-y-auto transition-transform duration-300 transform ${showFullCard ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'}`}>
          <div 
            className="p-4 border-b flex justify-between items-center cursor-pointer"
            onClick={() => setShowFullCard(!showFullCard)}
          >
            <h3 className="font-medium text-sm truncate pr-4">
              {selectedApplication.title || selectedApplication.address || 'Application Details'}
            </h3>
            <button className="h-1 w-10 bg-gray-300 rounded-full" aria-label="Toggle card size" />
          </div>
          
          <div className="p-4">
            <SearchResultCard
              application={selectedApplication}
              onSeeOnMap={() => {}}
              applications={applications}
              selectedId={selectedId}
              coordinates={coordinates}
              handleMarkerClick={handleMarkerClick}
              isLoading={isLoading}
              postcode={postcode}
            />
          </div>
        </div>
      )}
    </div>
  );
};
