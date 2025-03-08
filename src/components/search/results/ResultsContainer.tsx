
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
  const shouldShowMap = showMap && hasCoordinates && hasApplications;
  
  console.log("🌍 Map visibility state:", {
    showMap,
    hasCoordinates,
    coordinates,
    selectedId,
    applications: applications.length,
    displayApplications: displayApplications.length,
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
    
    // Set map as visible, select the application, and trigger the marker click
    setShowMap(true);
    setSelectedId(id);
    handleMarkerClick(id);
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

  // Debug log for mobile specifically
  useEffect(() => {
    if (isMobile) {
      console.log("📱 Mobile results:", {
        displayApplicationsCount: displayApplications.length,
        applicationsCount: applications.length,
        isLoading
      });
    }
  }, [isMobile, displayApplications, applications, isLoading]);

  return (
    <ContainerLayout shouldShowMap={shouldShowMap} isMobile={isMobile}>
      {/* Application list - Always show */}
      <ResultsListView 
        applications={displayApplications}
        isLoading={isLoading}
        onSeeOnMap={handleSeeOnMap}
        searchTerm={searchTerm}
        onRetry={handleRetry}
      />
      
      {/* Mobile map overlay */}
      {isMobile && shouldShowMap && coordinates && (
        <MobileMapView 
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
          postcode={searchTerm || ""}
        />
      )}
      
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
