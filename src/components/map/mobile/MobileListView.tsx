
import { Application } from "@/types/planning";
import { ImageResolver } from "@/components/map/mobile/components/ImageResolver";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface MobileListViewProps {
  applications: Application[];
  selectedApplication?: number | null;
  postcode: string;
  onSelectApplication: (id: number) => void;
  onShowEmailDialog: () => void;
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: string) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: string;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  hideFilterBar?: boolean;
  onClose?: () => void;
}

export const MobileListView = ({
  applications,
  selectedApplication,
  postcode,
  onSelectApplication,
  onShowEmailDialog,
  hideFilterBar,
  onClose
}: MobileListViewProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {applications.map((app) => {
          // Format received date
          const formattedReceivedDate = app.received || app.received_date
            ? new Date(app.received || app.received_date).toString() !== "Invalid Date"
              ? format(new Date(app.received || app.received_date), 'dd MMM yyyy')
              : null
            : null;
            
          return (
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
                    title={app.title || ''}
                    applicationId={app.id}
                    coordinates={app.coordinates}
                    classification={app.category}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary">
                    {app.title || 'Planning Application'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 truncate">
                    {app.description}
                  </div>
                  
                  {/* Received date display */}
                  {formattedReceivedDate && (
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      <CalendarDays className="w-3 h-3" />
                      <p className="text-xs">Received: {formattedReceivedDate}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <ApplicationBadges
                      status={app.status}
                      lastDateConsultationComments={app.last_date_consultation_comments}
                      impactScore={app.final_impact_score}
                    />
                    {app.distance && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          {app.distance}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
