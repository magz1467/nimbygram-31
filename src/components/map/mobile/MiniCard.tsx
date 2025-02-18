
import { Application } from "@/types/planning";
import { MapPin, Factory, Building, Construction, HousePlus, Hospital, PlusSquare, Store, Landmark, Trash2 } from "lucide-react";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageResolver } from "./components/ImageResolver";

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  // Add debug logging
  console.log('MiniCard received application:', {
    id: application.id,
    category: application.category,
    title: application.title
  });

  // Simplified title rendering - just use the category and title directly
  const title = application.category ? 
    <span>{application.category}: {application.title}</span> :
    application.title;

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
            title={application.title || ''}
            applicationId={application.id}
            coordinates={application.coordinates}
            class_3={application.category || null}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {application.address}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <ApplicationBadges
              status={application.status}
              lastDateConsultationComments={application.last_date_consultation_comments}
              impactScore={application.final_impact_score}
            />
            <span className="text-xs text-gray-500">{application.distance}</span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-2 text-xs text-gray-500 text-center">
        Pull up to see all applications
      </div>
    </div>
  );
};
