
import { Application } from "@/types/planning";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { MapView } from "@/components/applications/dashboard/components/MapView";
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
  handleMarkerClick: (id: number | null) => void;
  isLoading: boolean;
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
}: ResultsContainerProps) => {
  console.log('🌍 Map visibility state:', {
    showMap,
    hasCoordinates: !!coordinates,
    coordinates: coordinates,
    selectedId,
    applications: applications.length,
    isLoading
  });

  const shouldShowMap = showMap && coordinates && applications.length > 0;
  
  console.log('🎯 Should show map?', {
    shouldShowMap,
    conditions: {
      showMap,
      hasCoordinates: !!coordinates,
      hasApplications: applications.length > 0
    }
  });

  return (
    <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-16rem)]">
      <div className="flex gap-6 relative min-h-full">
        <div className={`${shouldShowMap ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          <SearchResultsList 
            applications={displayApplications}
            isLoading={isLoading}
            onSeeOnMap={(id) => {
              console.log('📍 See on map clicked:', { id, currentCoords: coordinates });
              setSelectedId(id);
              setShowMap(true);
            }}
          />
        </div>
        {shouldShowMap && (
          <div className="w-1/2 relative">
            <div className="sticky top-4 h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                onClick={() => {
                  console.log('❌ Closing map');
                  setShowMap(false);
                  setSelectedId(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="w-full h-full">
                <MapView 
                  applications={applications}
                  selectedId={selectedId}
                  coordinates={coordinates}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
