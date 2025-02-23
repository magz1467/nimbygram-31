
import { Application } from "@/types/planning";
import { ImageResolver } from "@/components/map/mobile/components/ImageResolver";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { SortType } from "@/types/application-types";
import { AlertSection } from "./AlertSection";

interface ApplicationListViewProps {
  applications: Application[];
  selectedApplication?: number | null;
  postcode: string;
  onSelectApplication: (id: number) => void;
  onShowEmailDialog: () => void;
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: SortType;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  hideFilterBar?: boolean;
  onClose?: () => void;
}

export const ApplicationListView = ({
  applications,
  selectedApplication,
  postcode,
  onSelectApplication,
  onShowEmailDialog,
  hideFilterBar,
  onClose
}: ApplicationListViewProps) => {
  return (
    <div className="h-full flex flex-col">
      {!hideFilterBar && (
        <AlertSection 
          postcode={postcode} 
          onShowEmailDialog={onShowEmailDialog} 
        />
      )}
      <div className="flex-1 overflow-y-auto">
        {applications.map((app) => (
          <div
            key={app.id}
            className="py-3 px-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelectApplication(app.id)}
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <ImageResolver
                  imageMapUrl={app.image_map_url}
                  image={app.image}
                  title={app.title || app.description || ''}
                  applicationId={app.id}
                  coordinates={app.coordinates}
                  class_3={app.category}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-primary mb-1">
                  {app.category ? (
                    <>
                      <span className="text-primary">{app.category}</span>
                      <span className="text-gray-600">: </span>
                    </>
                  ) : null}
                  <span className="text-primary line-clamp-2">{app.title || app.description}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{app.address}</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  <ApplicationBadges
                    status={app.status}
                    lastDateConsultationComments={app.last_date_consultation_comments}
                    impactScore={app.final_impact_score}
                  />
                  {app.distance && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{app.distance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
