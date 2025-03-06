
import { Application } from "@/types/planning";
import { SearchResultsList } from "../SearchResultsList";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResultsContainerProps {
  displayApplications: Application[];
  applications: Application[];
  coordinates: [number, number] | null;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  handleMarkerClick: (id: number) => void;
  isLoading: boolean;
  searchTerm?: string;
}

export const ResultsContainer = ({
  displayApplications,
  applications,
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  isLoading,
  searchTerm
}: ResultsContainerProps) => {
  const [shouldShowMap, setShouldShowMap] = useState(false);

  useEffect(() => {
    // Log map visibility state for debugging
    console.log('🌍 Map visibility state:', {
      showMap,
      hasCoordinates: !!coordinates,
      coordinates,
      selectedId,
      applications: applications?.length || 0,
      isLoading
    });
    
    // Determine if we can show the map
    const conditions = {
      showMap,
      hasCoordinates: !!coordinates,
      hasApplications: (applications?.length || 0) > 0
    };
    
    const shouldShow = conditions.showMap && conditions.hasCoordinates && conditions.hasApplications;
    setShouldShowMap(shouldShow);
    
    console.log('🎯 Should show map?', {
      shouldShowMap: shouldShow,
      conditions
    });
  }, [showMap, coordinates, applications, selectedId, isLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`grid ${shouldShowMap ? 'grid-cols-2' : 'grid-cols-1'} gap-6 relative`}>
        <div className={shouldShowMap ? 'col-span-1' : 'col-span-1'}>
          <SearchResultsList 
            applications={displayApplications} 
            isLoading={isLoading}
            onSeeOnMap={handleMarkerClick}
            searchTerm={searchTerm}
          />
        </div>
        
        {shouldShowMap && coordinates && (
          <div className="col-span-1 relative h-[calc(100vh-200px)] rounded-lg border border-gray-200 overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full h-8 w-8 p-0 flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-md"
                onClick={() => setShowMap(false)}
                aria-label="Close map"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <MapView
              applications={applications}
              selectedId={selectedId}
              coordinates={coordinates}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};
