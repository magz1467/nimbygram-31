import { Application } from "@/types/planning";
import { MapHeader } from "./MapHeader";
import { DesktopSidebar } from "./DesktopSidebar";
import { MapContainerComponent } from "./MapContainer";
import { MobileApplicationCards } from "./MobileApplicationCards";
import { LoadingOverlay } from "./LoadingOverlay";
import { EmailDialog } from "@/components/EmailDialog";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef, useState } from "react";
import { MobileListView } from "./mobile/MobileListView";
import { MobileDetailsView } from "./mobile/MobileDetailsView";

interface MapContentLayoutProps {
  isLoading: boolean;
  coordinates: [number, number];
  postcode: string;
  selectedApplication: number | null;
  filteredApplications: Application[];
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: 'closingSoon' | 'newest' | null;
  isMapView: boolean;
  isMobile: boolean;
  onMarkerClick: (id: number) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  onToggleView: () => void;
}

export const MapContentLayout = ({
  isLoading,
  coordinates,
  postcode,
  selectedApplication,
  filteredApplications,
  activeFilters,
  activeSort,
  isMapView,
  isMobile,
  onMarkerClick,
  onFilterChange,
  onSortChange,
  onToggleView,
}: MapContentLayoutProps) => {
  const selectedApp = filteredApplications.find(app => app.id === selectedApplication);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { toast } = useToast();

  // Select first application by default when applications load
  useEffect(() => {
    if (filteredApplications.length > 0 && !selectedApplication && isMapView) {
      onMarkerClick(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedApplication, isMapView, onMarkerClick]);

  const handleEmailSubmit = (email: string, radius: string) => {
    const radiusText = radius === "1000" ? "1 kilometre" : `${radius} metres`;
    toast({
      title: "Subscription pending",
      description: `We've sent a confirmation email to ${email}. Please check your inbox and click the link to confirm your subscription for planning alerts within ${radiusText} of ${postcode}. The email might take a few minutes to arrive.`,
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
      {isLoading && <LoadingOverlay />}
      
      <MapHeader 
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={onToggleView}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        {!isMobile && (
          <DesktopSidebar
            applications={filteredApplications}
            selectedApplication={selectedApplication}
            postcode={postcode}
            activeFilters={activeFilters}
            activeSort={activeSort}
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
            onSelectApplication={onMarkerClick}
            onClose={() => onMarkerClick(null)}
          />
        )}
        
        <div 
          className={`flex-1 relative ${isMobile ? (isMapView ? 'block' : 'hidden') : 'block'}`}
          style={{ height: isMobile ? 'calc(100dvh - 120px)' : '100%' }}
        >
          <MapContainerComponent
            coordinates={coordinates}
            postcode={postcode}
            applications={filteredApplications}
            selectedApplication={selectedApplication}
            onMarkerClick={onMarkerClick}
          />

          {isMobile && selectedApplication !== null && isMapView && (
            <MobileApplicationCards
              applications={filteredApplications}
              selectedId={selectedApplication}
              onSelectApplication={onMarkerClick}
            />
          )}
        </div>
        
        {isMobile && !isMapView && (
          <div className="flex-1 overflow-hidden">
            {selectedApplication !== null && selectedApp ? (
              <MobileDetailsView
                application={selectedApp}
                onClose={() => onMarkerClick(null)}
              />
            ) : (
              <MobileListView
                postcode={postcode}
                applications={filteredApplications}
                onSelectApplication={onMarkerClick}
                onShowEmailDialog={() => setShowEmailDialog(true)}
              />
            )}
          </div>
        )}
      </div>

      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
};