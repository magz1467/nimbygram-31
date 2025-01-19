import { Application } from "@/types/planning";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { ApplicationTitle } from "@/components/applications/ApplicationTitle";
import { useApplicationSorting, SortType } from "@/hooks/use-sort-applications";
import { ImageResolver } from "@/components/map/mobile/components/ImageResolver";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";

interface PlanningApplicationListProps {
  applications: Application[];
  postcode: string;
  onSelectApplication: (id: number | null) => void;
  activeSort?: SortType;
  onFeedback?: (applicationId: number, type: 'yimby' | 'nimby') => void;
}

export const PlanningApplicationList = ({
  applications,
  onSelectApplication,
  activeSort,
  postcode,
  onFeedback
}: PlanningApplicationListProps) => {
  const sortedApplications = useApplicationSorting({
    type: activeSort || null,
    applications
  });

  console.log('PlanningApplicationList - Rendering with applications:', applications?.length);

  if (!applications?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-2">No planning applications found</p>
        <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  const handleFeedback = (applicationId: number, type: 'yimby' | 'nimby') => {
    if (onFeedback) {
      onFeedback(applicationId, type);
    }
  };

  return (
    <div className="divide-y">
      {sortedApplications.map((application) => (
        <div
          key={application.id}
          className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onSelectApplication(application.id)}
        >
          <div className="flex gap-3">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <ImageResolver
                imageMapUrl={application.image_map_url}
                image={application.image}
                title={application.title || application.description || ''}
                applicationId={application.id}
                coordinates={application.coordinates}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ApplicationTitle 
                title={application.engaging_title || application.description || ''} 
                className="mb-1"
              />
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <MapPin className="w-3 h-3" />
                <p className="text-sm truncate">{application.address}</p>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <ApplicationBadges
                  status={application.status}
                  lastDateConsultationComments={application.last_date_consultation_comments}
                  impactScore={application.final_impact_score}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{application.distance}</span>
                  {application.feedback_stats && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 flex items-center gap-1 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(application.id, 'yimby');
                        }}
                      >
                        <div className="w-4 h-4 rounded-full overflow-hidden">
                          <ImageWithFallback
                            src="/lovable-uploads/3df4c01a-a60f-43c5-892a-18bf170175b6.png"
                            alt="YIMBY"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-gray-600 text-xs">{application.feedback_stats.yimby || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 flex items-center gap-1 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(application.id, 'nimby');
                        }}
                      >
                        <div className="w-4 h-4 rounded-full overflow-hidden">
                          <ImageWithFallback
                            src="/lovable-uploads/4dfbdd6f-07d8-4c20-bd77-0754d1f78644.png"
                            alt="NIMBY"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-gray-600 text-xs">{application.feedback_stats.nimby || 0}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};