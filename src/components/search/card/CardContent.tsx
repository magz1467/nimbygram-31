
import { formatStorybook } from "@/utils/storybook-formatter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
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

  const formattedStorybook = formatStorybook(storybook);
  console.log('📚 Formatted storybook:', formattedStorybook);

  // Map button to use throughout the component
  const mapButton = (
    <Button 
      variant="outline" 
      onClick={handleSeeOnMapClick}
      className="w-full text-primary flex items-center justify-center gap-1.5"
    >
      <MapPin className="w-4 h-4" />
      See on map
    </Button>
  );

  // If no storybook content, just return the button
  if (!formattedStorybook) {
    return <div className="mt-4">{mapButton}</div>;
  }

  // Render the formatted storybook content from sections or fallback to direct content
  return (
    <div className="space-y-6">
      {/* Show the button at the top for consistency */}
      {mapButton}

      {/* What's the Deal section */}
      {formattedStorybook.sections?.find(s => s.type === 'deal') && (
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
      {formattedStorybook.sections?.find(s => s.type === 'details') && (
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
      {formattedStorybook.sections?.find(s => s.type === 'nimby') && (
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

      {/* Fallback for old format or if sections weren't properly detected */}
      {!formattedStorybook.sections && formattedStorybook.content && (
        <div className="prose prose-sm max-w-none mt-4" 
          dangerouslySetInnerHTML={{ __html: formattedStorybook.content }} 
        />
      )}

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
