
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

import { ContainerLayout } from "./ContainerLayout";
import { ResultsListView } from "./ResultsListView";
import { MobileMapView } from "./MobileMapView";
import { DesktopMapView } from "./DesktopMapView";

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
  onRetry?: () => void;
}

export const ResultsContainer = ({
  displayApplications = [],
  applications = [],
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  isLoading,
  searchTerm,
  onRetry
}: ResultsContainerProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const hasCoordinates = Boolean(coordinates);
  const hasApplications = applications.length > 0;

  // Determine if we should show the map
  const shouldShowMap = showMap && hasCoordinates && hasApplications;
  
  console.log("🌍 Map visibility state:", {
    showMap,
    hasCoordinates,
    coordinates,
    selectedId,
    applications: applications.length,
    isLoading,
    isMobile,
    shouldShowMap
  });
  
  // Helper function to handle "See on Map" clicks
  const handleSeeOnMap = (id: number) => {
    console.log('🗺️ See on Map clicked for ID:', id);
    
    if (!hasCoordinates) {
      toast({
        title: "Map error",
        description: "Unable to show the map. Location coordinates not found.",
        variant: "destructive"
      });
      return;
    }
    
    setShowMap(true);
    setSelectedId(id);
    handleMarkerClick(id);
    
    if (isMobile) {
      // On mobile, scroll to make sure map is visible
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Handler for retrying the search
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Handler to close the map and return to results list
  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedId(null);
  };

  return (
    <ContainerLayout shouldShowMap={shouldShowMap} isMobile={isMobile}>
      {/* On mobile, if map is shown, display it first */}
      {isMobile && shouldShowMap && coordinates && (
        <MobileMapView 
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
        />
      )}
      
      {/* Application list */}
      <div className={shouldShowMap && !isMobile ? "col-span-1" : ""}>
        {!shouldShowMap && (
          <ResultsListView 
            applications={displayApplications}
            isLoading={isLoading}
            onSeeOnMap={handleSeeOnMap}
            searchTerm={searchTerm}
            onRetry={handleRetry}
          />
        )}
      </div>
      
      {/* Desktop map layout */}
      {!isMobile && shouldShowMap && coordinates && (
        <DesktopMapView
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
        />
      )}
    </ContainerLayout>
  );
};
