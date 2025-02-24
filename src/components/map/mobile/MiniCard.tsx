
import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageResolver } from "./components/ImageResolver";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  // Determine content to display (storybook or fallback)
  const title = application.storybook_header || (application.category ? (
    `${application.category}: ${application.title || ''}`
  ) : application.title) || '';

  const content = application.storybook || application.description || '';

  return (
    <div className="fixed bottom-2 left-2 right-2 bg-white border rounded-lg shadow-lg z-[1000]">
      <div 
        className="flex gap-3 p-4 cursor-pointer touch-pan-y" 
        onClick={onClick}
      >
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <ImageResolver
            imageMapUrl={application.image_map_url}
            image={application.image}
            title={title}
            applicationId={application.id}
            coordinates={application.coordinates}
            class_3={application.category || null}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-primary mb-1 line-clamp-2">
            {title}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-2">{application.address}</span>
            </span>
          </p>
          <div className="text-sm text-gray-600 mb-2 line-clamp-2">
            {content}
          </div>
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
      </div>
      <div className="px-4 pb-2 text-xs text-gray-500 text-center">
        Pull up to see all applications
      </div>
    </div>
  );
};

