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
  
  const handleSeeOnMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('💡 See on map button clicked');
    
    if (isMobile) {
      // On mobile, use the existing handler
      onSeeOnMap();
    } else {
      // On desktop, open the map dialog
      setShowMapDialog(true);
      console.log('🗺️ Opening map dialog with app ID:', applicationId);
      
      // Ensure this application is selected
      if (handleMarkerClick && applicationId) {
        handleMarkerClick(applicationId);
      }
    }
  };

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

  return (
    <div className="space-y-6">
      {/* See on Map button - always visible as its own row */}
      <Button 
        variant="outline" 
        onClick={handleSeeOnMapClick}
        className="w-full text-primary flex items-center justify-center gap-1.5"
      >
        <MapPin className="w-4 h-4" />
        See on map
      </Button>

      {/* Map Dialog for Desktop */}
      {!isMobile && applicationId && (
        <DesktopMapDialog
          applications={applications}
          selectedId={applicationId}
          coordinates={coordinates || [51.505, -0.09]} // Fallback coordinates
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
