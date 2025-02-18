
import { Application } from "@/types/planning";
import { MapPin, Factory, Building, Construction, HousePlus, HospitalSquare, PlusSquare, Store, Landmark, Trash2 } from "lucide-react";
import { ApplicationTitle } from "@/components/applications/ApplicationTitle";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageResolver } from "./components/ImageResolver";

// Define category icons mapping
const CATEGORY_ICONS: { [key: string]: JSX.Element } = {
  'Industrial': <Factory className="h-4 w-4" />,
  'Hospital': <HospitalSquare className="h-4 w-4" />,
  'Commercial': <Store className="h-4 w-4" />,
  'Extension': <HousePlus className="h-4 w-4" />,
  'New Build': <Building className="h-4 w-4" />,
  'Listed Building': <Landmark className="h-4 w-4" />,
  'Change of Use': <PlusSquare className="h-4 w-4" />,
  'Demolition': <Trash2 className="h-4 w-4" />,
  'Planning Conditions': <Construction className="h-4 w-4" />,
};

interface MiniCardProps {
  application: Application;
  onClick: () => void;
}

export const MiniCard = ({ application, onClick }: MiniCardProps) => {
  const categoryIcon = application.category ? CATEGORY_ICONS[application.category] : <Building className="h-4 w-4" />;

  const formattedTitle = application.category ? 
    <div className="flex items-center gap-2">
      {categoryIcon}
      <span>{application.category}: {application.title}</span>
    </div> :
    <ApplicationTitle title={application.title || ''} />;

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
            {formattedTitle}
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
