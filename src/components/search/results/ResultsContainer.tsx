
import { Application } from "@/types/planning";
import { SearchResultsList } from "../SearchResultsList";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { useState, useEffect } from "react";

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
