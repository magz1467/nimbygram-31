
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
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex gap-6 relative">
        <div className={`${showMap ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          <SearchResultsList 
            applications={displayApplications}
            isLoading={isLoading}
            onSeeOnMap={(id) => {
              setSelectedId(id);
              setShowMap(true);
            }}
          />
        </div>
        {showMap && coordinates && (
          <div className="w-1/2 relative">
            <div className="sticky top-4 h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                onClick={() => {
                  setShowMap(false);
                  setSelectedId(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <MapView 
                applications={applications}
                selectedId={selectedId}
                coordinates={coordinates}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
