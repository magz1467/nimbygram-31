
import { Application } from "@/types/planning";
import { FilterBar } from "@/components/FilterBar";
import { AlertSection } from "./AlertSection";
import { SortType } from "@/types/application-types";
import { ImageResolver } from "@/components/map/mobile/components/ImageResolver";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";

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
}

export const ApplicationListView = ({
  applications,
  selectedApplication,
  postcode,
  onSelectApplication,
  onShowEmailDialog,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  statusCounts,
}: ApplicationListViewProps) => {
  return (
    <div className="h-full flex flex-col">
      <AlertSection 
        postcode={postcode} 
        onShowEmailDialog={onShowEmailDialog} 
      />
      
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
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary truncate">
                  {app.engaging_title || app.description}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {app.address}
                </p>
                <div className="flex flex-col gap-1.5 mt-2">
                  <ApplicationBadges
                    status={app.status}
                    lastDateConsultationComments={app.last_date_consultation_comments}
                    impactScore={app.final_impact_score}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{app.distance}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
