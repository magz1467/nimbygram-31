
import { Application } from "@/types/planning";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { useState } from "react";
import { ImageResolver } from "./components/ImageResolver";
import { StatusBadge } from "./components/StatusBadge";

interface MobileListViewProps {
  postcode: string;
  applications: Application[];
  selectedApplication?: number | null;
  onSelectApplication: (id: number) => void;
  onShowEmailDialog: () => void;
  hideFilterBar?: boolean;
  onClose?: () => void;
}

export const MobileListView = ({
  postcode,
  applications,
  selectedApplication,
  onSelectApplication,
  onShowEmailDialog,
  hideFilterBar,
  onClose
}: MobileListViewProps) => {
  const [showAlerts, setShowAlerts] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col h-full max-h-[100dvh] overflow-hidden bg-gray-50">
      {showAlerts && (
        <div className="p-4 bg-white border-b relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => setShowAlerts(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Get Updates for This Area</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Stay informed about new planning applications near {postcode}
            </p>
            <Button 
              className="w-full"
              onClick={onShowEmailDialog}
            >
              Get Alerts
            </Button>
          </div>
        </div>
      )}
      <div className="p-4 space-y-4 overflow-y-auto">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectApplication(app.id)}
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <ImageResolver
                  imageMapUrl={app.image_map_url}
                  image={app.image}
                  title={app.title || app.description || ''}
                  applicationId={app.id}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary">
                  {app.storybook_header || (app.category ? (
                    `${app.category}: ${app.title || ''}`
                  ) : app.ai_title || app.title || app.description)}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {app.storybook || app.description || app.address}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-gray-500">{app.distance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

