
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
  const [mapMounted, setMapMounted] = useState(false);

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
    shouldShowMap,
    mapMounted
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
    
    // Set map as visible and select the application
    setShowMap(true);
    setSelectedId(id);
    handleMarkerClick(id);
    
    // Force the map to be mounted and visible
    setMapMounted(true);
    
    if (isMobile) {
      // On mobile, scroll to make sure map is visible
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
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
    
    // Reset map mounted state after a delay
    setTimeout(() => {
      setMapMounted(false);
    }, 100);
  };

  // Ensure map is always visible when showMap is true
  useEffect(() => {
    if (showMap && hasCoordinates && hasApplications) {
      console.log("🌍 Ensuring map is visible");
      setMapMounted(true);
      
      // Force the body to not scroll when map is shown on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      
      // Add a small delay before checking map visibility
      setTimeout(() => {
        // Make sure the map container is rendered
        const mapContainer = document.querySelector('.mobile-map-container, .desktop-map-container');
        if (!mapContainer) {
          console.log("⚠️ Map container not found, forcing re-render");
          // Force a re-render by toggling showMap
          setShowMap(false);
          setTimeout(() => setShowMap(true), 50);
        }
      }, 100);
    } else {
      // Reset body overflow when map is hidden
      document.body.style.overflow = '';
    }
    
    return () => {
      // Clean up
      document.body.style.overflow = '';
    };
  }, [showMap, hasCoordinates, hasApplications, setShowMap, isMobile]);

  // Effect to handle mobile view for map
  useEffect(() => {
    if (isMobile && shouldShowMap) {
      console.log("📱 Setting up mobile map view");
      
      // Ensure body doesn't scroll when map is visible on mobile
      document.body.style.overflow = 'hidden';
      
      // Force the window to scroll to top to ensure map is in view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, shouldShowMap]);

  return (
    <ContainerLayout shouldShowMap={shouldShowMap} isMobile={isMobile}>
      {/* On mobile, if map is shown, display it first */}
      {isMobile && shouldShowMap && coordinates && mapMounted && (
        <MobileMapView 
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
        />
      )}
      
      {/* Application list - Only show when map is not visible on mobile */}
      <div className={shouldShowMap && !isMobile ? "col-span-1" : ""}>
        {(!shouldShowMap || !isMobile) && (
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
