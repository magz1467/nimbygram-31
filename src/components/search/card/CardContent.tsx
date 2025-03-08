
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
  const formattedStorybook = formatStorybook(storybook);
  const isMobile = useIsMobile();
  const [showMapDialog, setShowMapDialog] = useState(false);
  
  if (!formattedStorybook?.content) return null;

  const parseHtmlContent = (content: string) => {
    return content
      .replace(/<\/?strong>/g, '')
      .replace(/<\/?p>/g, '')
      .replace(/<br\/?>/g, '\n')
      .trim();
  };

  const getKeyDetails = (content: string) => {
    const detailsSection = content.split('The Details:')[1]?.split('Considerations:')[0];
    if (!detailsSection) return [];
    
    return detailsSection
      .split('•')
      .slice(1)
      .map(detail => detail.trim())
      .filter(detail => detail.length > 0);
  };

  const handleSeeOnMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('💡 See on map button clicked');
    
    if (isMobile) {
      // On mobile, use the existing handler
      onSeeOnMap();
    } else {
      // On desktop, open the map dialog
      if (coordinates && applicationId) {
        setShowMapDialog(true);
        // Ensure this application is selected
        if (handleMarkerClick) {
          handleMarkerClick(applicationId);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <div className="bg-primary/5 rounded-lg p-4">
          {isMobile ? (
            <>
              <h3 className="text-primary font-semibold mb-2">What's the Deal</h3>
              <div className="text-gray-700">
                {parseHtmlContent(formattedStorybook.content.split('The Details:')[0])}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-primary font-semibold">What's the Deal</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSeeOnMapClick}
                  className="text-primary flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  See on map
                </Button>
              </div>
              <div className="text-gray-700">
                {parseHtmlContent(formattedStorybook.content.split('The Details:')[0])}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile-only map button as a separate row */}
      {isMobile && (
        <Button 
          variant="outline" 
          onClick={handleSeeOnMapClick}
          className="w-full text-primary flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-4 h-4" />
          See on map
        </Button>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Key Details</h3>
        <div className="grid gap-4">
          {getKeyDetails(formattedStorybook.content).map((detail, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-gray-700 flex-1">{parseHtmlContent(detail)}</p>
            </div>
          ))}
        </div>
      </div>

      {formattedStorybook.content.includes('Nimbywatch:') && (
        <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            🏘️ Nimbywatch
          </h3>
          <div className="space-y-2 text-white/90">
            {formattedStorybook.content
              .split('Nimbywatch:')[1]
              .split('•')
              .filter(Boolean)
              .map((point, index) => (
                <p key={index} className="text-sm">
                  {parseHtmlContent(point.trim())}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Map Dialog for Desktop */}
      {!isMobile && applicationId && coordinates && (
        <DesktopMapDialog
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
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
