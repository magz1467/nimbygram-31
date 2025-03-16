
import { formatStorybook } from "@/utils/storybook-formatter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { DesktopMapDialog } from "@/components/search/results/DesktopMapDialog";
import { Application } from "@/types/planning";

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

  // Map button to use throughout the component
  const mapButton = (
    <Button 
      variant="outline" 
      onClick={handleSeeOnMapClick}
      className="w-full text-primary flex items-center justify-center gap-1.5 mt-4"
    >
      <MapPin className="w-4 h-4" />
      See on map
    </Button>
  );

  // If no storybook content at all, just return the button
  if (!storybook) {
    return <div>{mapButton}</div>;
  }

  // Render the formatted storybook content from sections or fallback to direct content
  return (
    <div className="space-y-6">
      {/* What's the Deal section */}
      {formattedStorybook?.sections?.find(s => s.type === 'deal') && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="text-primary font-semibold mb-2">What's the Deal</h3>
            <div className="text-gray-700">
              {formattedStorybook.sections.find(s => s.type === 'deal')?.content}
            </div>
          </div>
        </div>
      )}

      {/* Key Details section */}
      {formattedStorybook?.sections?.find(s => s.type === 'details') && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Key Details</h3>
          <div className="grid gap-4">
            {Array.isArray(formattedStorybook.sections.find(s => s.type === 'details')?.content) ? (
              formattedStorybook.sections
                .find(s => s.type === 'details')
                ?.content
                .map((detail: string, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-gray-700 flex-1">{detail}</p>
                  </div>
                ))
            ) : (
              <p className="text-gray-700">
                {formattedStorybook.sections.find(s => s.type === 'details')?.content}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Nimbywatch section */}
      {formattedStorybook?.sections?.find(s => s.type === 'nimby') && (
        <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            🏘️ Nimbywatch
          </h3>
          <div className="space-y-2 text-white/90">
            <p className="text-sm">
              {formattedStorybook.sections.find(s => s.type === 'nimby')?.content}
            </p>
          </div>
        </div>
      )}

      {/* Fallback for content with no sections */}
      {!formattedStorybook?.sections && formattedStorybook?.content && (
        <div className="prose prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: formattedStorybook.content }} 
        />
      )}

      {/* Raw fallback if nothing was processed correctly */}
      {!formattedStorybook?.sections && !formattedStorybook?.content && storybook && (
        <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-900 font-medium mb-2">Application Details</h3>
          <p className="whitespace-pre-wrap text-gray-700">{storybook}</p>
        </div>
      )}

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
    </div>
  );
};
