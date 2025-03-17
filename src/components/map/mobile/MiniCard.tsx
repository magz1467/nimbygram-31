
import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";
import { formatStorybook } from "@/utils/storybook";
import { DragHandle } from "./components/DragHandle";
import { ApplicationTitle } from "./components/ApplicationTitle";
import { StorybookContent } from "./components/StorybookContent";
import { PullUpHint } from "./components/PullUpHint";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const formattedStorybook = formatStorybook(application.storybook);
  
  // Get the best available image
  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-lg shadow-lg z-[1000] max-h-[75vh] overflow-y-auto"
      onClick={onClick}
    >
      <DragHandle />
      
      <div className="flex flex-col p-4 cursor-pointer touch-pan-y">
        {/* Title Section */}
        <ApplicationTitle 
          title={application.title} 
          storybook={application.storybook} 
        />

        {/* Main Image */}
        <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={imageUrl}
            alt={formattedStorybook?.header || application.title || ''}
            className="w-full h-full object-cover"
            fallbackSrc="/placeholder.svg"
          />
        </div>

        {/* Address with icon */}
        <p className="text-sm text-gray-600 mb-3 text-left">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-2">{application.address}</span>
          </span>
        </p>

        {/* Formatted Storybook Content */}
        <StorybookContent 
          formattedStorybook={formattedStorybook}
          storybook={application.storybook}
          description={application.description}
        />

        {/* Badges and Distance */}
        <div className="flex items-center gap-2 mt-auto">
          <ApplicationBadges
            status={application.status}
            lastDateConsultationComments={application.last_date_consultation_comments}
            impactScore={application.final_impact_score}
          />
          {application.distance && (
            <span className="text-xs text-gray-500">{application.distance}</span>
          )}
        </div>
      </div>

      {/* Pull up hint */}
      <PullUpHint />
    </div>
  );
};
