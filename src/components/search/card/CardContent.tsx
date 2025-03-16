
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatStorybook } from "@/utils/storybook-formatter";
import { DesktopMapDialog } from "@/components/search/results/DesktopMapDialog";
import { Application } from "@/types/planning";
import { StorybookContent } from "./storybook/StorybookContent";
import { MapButton } from "./storybook/MapButton";

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
    console.log('💡 See on map button clicked');
    
    if (isMobile) {
      // On mobile, use the existing handler
      onSeeOnMap();
    } else {
      // On desktop, open the map dialog
      if (applicationId) {
        setShowMapDialog(true);
        // Ensure this application is selected
        if (handleMarkerClick && applicationId) {
          handleMarkerClick(applicationId);
        }
      }
    }
  };

  // Process storybook data with extended logging
  console.log('Processing storybook in CardContent, type:', typeof storybook, 
    'content:', storybook ? storybook.substring(0, 50) + '...' : 'null');
  
  const formattedStorybook = formatStorybook(storybook);
  
  // Add enhanced logging to see what we're working with
  console.log('CardContent storybook formatting result:', {
    hasStorybook: !!storybook,
    formattedResult: formattedStorybook ? {
      hasHeader: !!formattedStorybook.header,
      hasSections: !!formattedStorybook.sections,
      hasContent: !!formattedStorybook.content,
      sectionCount: formattedStorybook.sections?.length || 0
    } : null,
    sectionTypes: formattedStorybook?.sections?.map(s => s.type) || 'none',
    rawStorybook: storybook ? storybook.substring(0, 100) + '...' : 'none'
  });

  // If no storybook content at all, just return the button
  if (!storybook) {
    return <div><MapButton onClick={handleSeeOnMapClick} /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Render storybook content */}
      <StorybookContent 
        formattedStorybook={formattedStorybook} 
        rawStorybook={storybook} 
      />

      {/* Add the map button at the end */}
      <MapButton onClick={handleSeeOnMapClick} />

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
    </div>
  );
};
