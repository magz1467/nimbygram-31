import { Application } from "@/types/planning";
import { StatusBadge } from "./components/StatusBadge";
import { ImageResolver } from "./components/ImageResolver";
import { ClassificationBadge } from "@/components/applications/ClassificationBadge";

interface MiniCardProps {
  application: Application;
  isSelected?: boolean;
  onClick?: () => void;
}

export const MiniCard = ({ application, isSelected, onClick }: MiniCardProps) => {
  console.log('MiniCard - Application Data:', {
    id: application.id,
    final_impact_score: application.final_impact_score,
    title: application.title || application.description || ''
  });

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-500';
    if (score >= 70) return 'bg-red-50 text-red-600';
    if (score >= 50) return 'bg-orange-50 text-orange-600';
    if (score >= 30) return 'bg-yellow-50 text-yellow-600';
    return 'bg-green-50 text-green-600';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <ImageResolver
            imageMapUrl={application.image_map_url}
            image={application.image}
            title={application.title || application.description || ''}
            applicationId={application.id}
            coordinates={application.coordinates}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary truncate">
            {application.ai_title || application.description}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{application.address}</p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={application.status} />
            {application.class_3 && (
              <ClassificationBadge classification={application.class_3} />
            )}
            <span className="text-xs text-gray-500 ml-auto">{application.distance}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(application.final_impact_score)}`}>
              <span>Impact Score: </span>
              <span className="font-medium">
                {application.final_impact_score ?? 'N/A'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};