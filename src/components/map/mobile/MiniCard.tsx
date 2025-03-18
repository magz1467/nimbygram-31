
import { Application } from "@/types/planning";
import { MapPin, CalendarDays } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";
import { formatStorybook } from "@/utils/storybook";
import { DragHandle } from "./components/DragHandle";
import { LocationInfo } from "./components/LocationInfo";
import { PullUpHint } from "./components/PullUpHint";
import { format } from "date-fns";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const formattedStorybook = formatStorybook(application.storybook);
  
  // Get the best available image
  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);
  
  // Format received date
  const formattedReceivedDate = application.received || application.received_date
    ? new Date(application.received || application.received_date).toString() !== "Invalid Date"
      ? format(new Date(application.received || application.received_date), 'dd MMM yyyy')
      : null
    : null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-lg shadow-lg z-[1000] max-h-[40vh] overflow-y-auto"
      onClick={onClick}
    >
      <DragHandle />
      
      <div className="p-3 cursor-pointer touch-pan-y">
        {/* Compact header with image and title */}
        <div className="flex gap-3 mb-2">
          {/* Small image */}
          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={imageUrl}
              alt={formattedStorybook?.header || application.title || ''}
              className="w-full h-full object-cover"
              fallbackSrc="/placeholder.svg"
            />
          </div>
          
          {/* Title and location */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary text-sm leading-tight line-clamp-2 mb-1">
              {formattedStorybook?.header || application.title || 'Planning Application'}
            </h3>
            
            {application.address && (
              <LocationInfo address={application.address} />
            )}
            
            {/* Received date */}
            {formattedReceivedDate && (
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <CalendarDays className="w-3 h-3 text-gray-500" />
                <span className="text-xs">Received: {formattedReceivedDate}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Brief description - limited to 2 lines */}
        {formattedStorybook?.content && (
          <div 
            className="text-xs text-gray-600 mb-2 line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: formattedStorybook.content
            }}
          />
        )}

        {/* Badges and distance in footer */}
        <div className="flex items-center justify-between mt-auto">
          <ApplicationBadges
            status={application.status}
            lastDateConsultationComments={application.last_date_consultation_comments}
            impactScore={application.final_impact_score}
          />
          {application.distance && (
            <span className="text-xs text-gray-500 ml-2">{application.distance}</span>
          )}
        </div>
      </div>

      <PullUpHint />
    </div>
  );
};
