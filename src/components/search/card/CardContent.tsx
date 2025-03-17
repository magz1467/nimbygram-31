
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatStorybook } from "@/utils/storybook-formatter";
import { DesktopMapDialog } from "@/components/search/results/DesktopMapDialog";
import { Application } from "@/types/planning";
import { StorybookContent } from "./storybook/StorybookContent";
import { MapButton } from "./storybook/MapButton";
import { MobileMapView } from "@/components/search/results/MobileMapView";
import { FallbackContent } from "./storybook/FallbackContent";

interface CardContentProps {
  storybook: string | null;
  onSeeOnMap: () => void;
  applicationId?: number;
  applications?: Application[];
  selectedId?: number | null;
  coordinates?: [number, number] | null;
  handleMarkerClick?: (id: number) => void;
  isLoading?: boolean;
  postcode?: string;
}

export const CardContent = ({ 
  storybook, 
  onSeeOnMap,
  applicationId,
  applications = [],
  selectedId = null,
  coordinates = null,
  handleMarkerClick = () => {},
  isLoading = false,
  postcode = ""
}: CardContentProps) => {
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const isMobile = useIsMobile();
  
  const application = applications.find(app => app.id === applicationId);
  const applicationCoords = application?.coordinates;

  // Enhanced debugging for storybook data issues
  useEffect(() => {
    if (applicationId) {
      console.log(`CardContent for app ${applicationId}:`, {
        hasStorybook: Boolean(storybook),
        storybookType: storybook ? typeof storybook : null,
        storybookLength: storybook ? storybook.length : 0
      });
      
      if (storybook) {
        console.log(`Storybook preview for app ${applicationId}: ${storybook.substring(0, 150)}...`);
      } else {
        console.log(`No storybook for app ${applicationId}`);
      }
    }
  }, [applicationId, storybook]);

  const handleSeeOnMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('💡 See on map button clicked, isMobile:', isMobile);
    
    if (isMobile) {
      console.log('📱 Showing mobile map view for app:', applicationId);
      // Show mobile map view instead of using the external handler
      setShowMobileMap(true);
      
      // Ensure this application is selected
      if (handleMarkerClick && applicationId) {
        handleMarkerClick(applicationId);
      }
    } else {
      // On desktop, open the map dialog
      if (applicationId) {
        console.log('🖥️ Opening desktop map dialog for app:', applicationId);
        setShowMapDialog(true);
        // Ensure this application is selected
        if (handleMarkerClick && applicationId) {
          handleMarkerClick(applicationId);
        }
      }
    }
  };

  const handleCloseMap = () => {
    console.log('📱 Closing mobile map view');
    setShowMobileMap(false);
    setShowMapDialog(false);
  };

  // Process storybook data
  const formattedStorybook = formatStorybook(storybook);
  
  // Render the map button regardless of storybook content
  const mapButton = <MapButton onClick={handleSeeOnMapClick} />;
  
  // If no storybook content, render a simplified view with just the map button
  if (!storybook) {
    return (
      <div className="space-y-6">
        {mapButton}
        
        {/* Map components - desktop */}
        {!isMobile && applicationId && (
          <DesktopMapDialog
            applications={applications}
            selectedId={applicationId}
            coordinates={applicationCoords || coordinates as [number, number]}
            searchLocation={coordinates as [number, number]}
            handleMarkerClick={handleMarkerClick}
            isOpen={showMapDialog}
            onClose={() => setShowMapDialog(false)}
            isLoading={isLoading}
            postcode={postcode}
          />
        )}

        {/* Map components - mobile */}
        {isMobile && showMobileMap && applicationId && (applicationCoords || coordinates) && (
          <MobileMapView
            applications={applications}
            selectedId={applicationId}
            coordinates={(applicationCoords || coordinates) as [number, number]}
            handleMarkerClick={handleMarkerClick}
            handleCloseMap={handleCloseMap}
            isLoading={isLoading}
            postcode={postcode}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Render storybook content */}
      <StorybookContent 
        formattedStorybook={formattedStorybook} 
        rawStorybook={storybook} 
      />

      {/* Add the map button at the end */}
      {mapButton}

      {/* Map Dialog for Desktop */}
      {!isMobile && applicationId && (
        <DesktopMapDialog
          applications={applications}
          selectedId={applicationId}
          coordinates={applicationCoords as [number, number]}
          searchLocation={coordinates as [number, number]}
          handleMarkerClick={handleMarkerClick}
          isOpen={showMapDialog}
          onClose={() => setShowMapDialog(false)}
          isLoading={isLoading}
          postcode={postcode}
        />
      )}

      {/* Mobile Map View */}
      {isMobile && showMobileMap && applicationId && applicationCoords && (
        <MobileMapView
          applications={applications}
          selectedId={applicationId}
          coordinates={applicationCoords as [number, number]}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
          postcode={postcode}
        />
      )}
    </div>
  );
};
