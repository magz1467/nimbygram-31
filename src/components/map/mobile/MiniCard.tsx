
import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getImageUrl } from "@/utils/imageUtils";
import { formatStorybook } from "@/utils/storybook-formatter";
import { useEffect } from "react";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const formattedStorybook = formatStorybook(application.storybook);
  
  console.log('🎯 MiniCard rendering with:', {
    applicationId: application.id,
    hasStorybook: !!application.storybook,
    formattedStorybook: {
      hasHeader: !!formattedStorybook?.header,
      hasSections: !!formattedStorybook?.sections,
      sectionCount: formattedStorybook?.sections?.length
    },
    imageUrl: application.streetview_url || application.image || application.image_map_url
  });

  // Get the best available image
  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);

  useEffect(() => {
    console.log('🔍 MiniCard mounted with styles:', {
      container: document.querySelector('.fixed.bottom-0')?.className,
      image: document.querySelector('.aspect-video')?.className
    });
    return () => {
      console.log('👋 MiniCard unmounting');
    };
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-lg shadow-lg z-[1000] max-h-[75vh] overflow-y-auto"
      onClick={(e) => {
        console.log('🖱️ MiniCard container clicked');
        onClick();
      }}
    >
      <div className="drag-handle w-12 h-1 bg-gray-300 rounded-full mx-auto my-2" />
      
      <div className="flex flex-col p-4 cursor-pointer touch-pan-y">
        {/* Title Section */}
        <div className="font-semibold text-primary mb-3 text-lg">
          {formattedStorybook?.header || application.title || 'Planning Application'}
        </div>

        {/* Main Image - Now larger and more prominent */}
        <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={imageUrl}
            alt={formattedStorybook?.header || application.title || ''}
            className="w-full h-full object-cover"
            fallbackSrc="/placeholder.svg"
          />
        </div>

        {/* Address with icon */}
        <p className="text-sm text-gray-600 mb-3">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-2">{application.address}</span>
          </span>
        </p>

        {/* Formatted Storybook Content */}
        {formattedStorybook?.sections ? (
          <div className="text-sm text-gray-600 mb-3">
            {formattedStorybook.sections.find(s => s.type === 'deal') && (
              <div className="mb-2">
                <p className="font-medium">What's the Deal</p>
                <p className="line-clamp-2">
                  {formattedStorybook.sections.find(s => s.type === 'deal')?.content}
                </p>
              </div>
            )}
          </div>
        ) : formattedStorybook?.content ? (
          <div 
            className="text-sm text-gray-600 mb-3 line-clamp-3"
            dangerouslySetInnerHTML={{ 
              __html: formattedStorybook.content
            }}
          />
        ) : null}

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
      <div className="px-4 pb-4 pt-2 text-xs text-gray-500 text-center">
        Pull up to see all applications
      </div>
    </div>
  );
};
