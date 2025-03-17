
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
        storybookLength: storybook ? storybook.length : 0,
        hasApplicationCoords: Boolean(applicationCoords),
        hasCoordinates: Boolean(coordinates),
        isMobile
      });
    }
  }, [applicationId, storybook, applicationCoords, coordinates, isMobile]);

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
    console.log('📱 Closing map view');
    setShowMobileMap(false);
    setShowMapDialog(false);
  };

  // Process storybook data
  const formattedStorybook = formatStorybook(storybook);
  
  // Render the map button regardless of storybook content
  const mapButton = <MapButton onClick={handleSeeOnMapClick} />;
  
  // Determine which coordinates to use - prefer application coordinates, fall back to prop coordinates
  const mapCoordinates = applicationCoords || coordinates as [number, number];
  
  return (
    <div className="space-y-6">
      {/* Render storybook content if available */}
      {storybook ? (
        <StorybookContent 
          formattedStorybook={formattedStorybook} 
          rawStorybook={storybook} 
        />
      ) : (
        <FallbackContent content={null} storybook={null} />
      )}

      {/* Add the map button at the end */}
      {mapButton}

      {/* Map Dialog for Desktop */}
      {!isMobile && applicationId && mapCoordinates && (
        <DesktopMapDialog
          applications={applications}
          selectedId={applicationId}
          coordinates={mapCoordinates}
          searchLocation={coordinates as [number, number]}
          handleMarkerClick={handleMarkerClick}
          isOpen={showMapDialog}
          onClose={() => setShowMapDialog(false)}
          isLoading={isLoading}
          postcode={postcode}
        />
      )}

      {/* Mobile Map View */}
      {isMobile && showMobileMap && applicationId && mapCoordinates && (
        <MobileMapView
          applications={applications}
          selectedId={applicationId}
          coordinates={mapCoordinates}
          handleMarkerClick={handleMarkerClick}
          handleCloseMap={handleCloseMap}
          isLoading={isLoading}
          postcode={postcode}
        />
      )}
    </div>
  );
};
