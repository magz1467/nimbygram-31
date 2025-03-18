import { Application } from "@/types/planning";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { ApplicationTitle } from "@/components/applications/ApplicationTitle";
import { ApplicationBadges } from "@/components/applications/ApplicationBadges";
import { ImageResolver } from "@/components/map/mobile/components/ImageResolver";
import { FeedbackButtons } from "./FeedbackButtons";
import { SeeOnMapButton } from "./SeeOnMapButton";
import { ApplicationMapDialog } from "@/components/map/ApplicationMapDialog";

interface ApplicationListItemProps {
  application: Application;
  onSelect: (id: number) => void;
  onFeedback?: (applicationId: number, type: 'yimby' | 'nimby') => void;
  allApplications?: Application[];
  searchCoordinates?: [number, number]; // Search coordinates prop
}

export const ApplicationListItem = ({ 
  application,
  onSelect,
  onFeedback,
  allApplications = [],
  searchCoordinates
}: ApplicationListItemProps) => {
  const [showMap, setShowMap] = useState(false);
  
  const handleFeedback = (applicationId: number, type: 'yimby' | 'nimby') => {
    if (onFeedback) {
      onFeedback(applicationId, type);
    }
  };

  return (
    <>
      <div
        key={application.id}
        className="application-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        onClick={() => onSelect(application.id)}
      >
        <img 
          src={application.image || '/placeholder.svg'} 
          alt={application.title} 
          className="card-image w-full h-40 object-cover"
        />
        <div className="card-content p-4 flex flex-col h-full">
          <h3 className="card-title text-lg font-semibold mb-1 text-left">{application.title}</h3>
          <p className="card-address text-sm text-gray-600 mb-2 text-left">{application.address}</p>
          <div className="status-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {application.status}
          </div>
          <div className="card-actions flex justify-between items-center mt-auto pt-2">
            <div className="flex items-center gap-1 mt-1 text-gray-600">
              <MapPin className="w-3 h-3" />
              <p className="text-sm truncate">{application.address}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{application.distance}</span>
              {application.feedback_stats && (
                <FeedbackButtons
                  applicationId={application.id}
                  feedbackStats={application.feedback_stats}
                  onFeedback={handleFeedback}
                />
              )}
            </div>
          </div>
          
          {/* Add See on Map button if coordinates are available */}
          {application.coordinates && (
            <div className="mt-2 flex justify-end">
              <SeeOnMapButton onClick={() => setShowMap(true)} />
            </div>
          )}
        </div>
      </div>
      
      {/* Map Dialog - Using the specialized component */}
      {showMap && (
        <ApplicationMapDialog
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          application={application}
          allApplications={allApplications}
          searchCoordinates={searchCoordinates}
        />
      )}
    </>
  );
};
