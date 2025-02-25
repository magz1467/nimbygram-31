
import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageResolver } from "./components/ImageResolver";
import { formatStorybook } from "@/utils/storybook-formatter";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const storybook = formatStorybook(application.storybook);

  return (
    <div className="fixed bottom-2 left-2 right-2 bg-white border rounded-lg shadow-lg z-[1000]">
      <div 
        className="flex flex-col p-4 cursor-pointer touch-pan-y" 
        onClick={onClick}
      >
        {/* Header Section */}
        {storybook?.header ? (
          <div className="font-semibold text-primary mb-3 line-clamp-2">
            {storybook.header}
          </div>
        ) : (
          <div className="font-semibold text-primary mb-3 line-clamp-2">
            {application.title || 'Planning Application'}
          </div>
        )}

        {/* Centrally Aligned Larger Image */}
        <div className="w-full aspect-video mb-3 rounded-lg overflow-hidden bg-gray-100">
          <ImageResolver
            imageMapUrl={application.image_map_url}
            image={application.image}
            title={storybook?.header || application.title || ''}
            applicationId={application.id}
            coordinates={application.coordinates}
            class_3={application.category}
          />
        </div>

        {/* Address */}
        <p className="text-sm text-gray-600 mb-2">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-2">{application.address}</span>
          </span>
        </p>

        {/* Content */}
        {storybook?.content && (
          <div 
            className="text-sm text-gray-600 mb-2 line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: storybook.content
            }}
          />
        )}

        {/* Badges and Distance */}
        <div className="flex items-center gap-2">
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
      <div className="px-4 pb-2 text-xs text-gray-500 text-center">
        Pull up to see all applications
      </div>
    </div>
  );
};

