
import { Application } from "@/types/planning";
import { SearchResultsList } from "../SearchResultsList";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

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
      {(!isLoading && applications?.length > 0 && coordinates) && (
        <div className="flex justify-end mb-4">
          <div className="flex gap-2 bg-white rounded-md p-1 shadow-sm border">
            <Button
              variant={!showMap ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowMap(false)}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={showMap ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowMap(true)}
              className="flex items-center gap-2"
              disabled={!coordinates || applications.length === 0}
            >
              <Map className="h-4 w-4" />
              Map
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {shouldShowMap && coordinates ? (
          <div className="h-[600px]">
            <MapView
              applications={applications}
              coordinates={coordinates}
              selectedId={selectedId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        ) : (
          <SearchResultsList 
            applications={displayApplications} 
            isLoading={isLoading}
            onSeeOnMap={handleMarkerClick}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};
