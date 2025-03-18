import { Application } from "@/types/planning";
import { MapHeader } from "./MapHeader";
import { EmailDialog } from "@/components/EmailDialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { MobileListContainer } from "./mobile/MobileListContainer";
import { MapSection } from "./layout/MapSection";
import { DesktopSidebarSection } from "./layout/DesktopSidebarSection";
import { MapAction } from "@/types/map-reducer";
import { useErrorHandling } from "@/hooks/use-error-handling";

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
  dispatch: React.Dispatch<MapAction>;
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
  dispatch,
  onFilterChange,
  onSortChange,
  onToggleView,
}: MapContentLayoutProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { toast } = useToast();

  // Use the error handling hook
  useErrorHandling(isLoading, filteredApplications.length, !!coordinates);

  const handleEmailSubmit = (radius: string) => {
    const radiusText = radius === "1000" ? "1 kilometre" : `${radius} metres`;
    toast({
      title: "Subscription pending",
      description: `You will now receive planning alerts within ${radiusText} of ${postcode}`,
      duration: 5000,
    });
  };

  const handleClose = () => {
    dispatch({ type: 'SELECT_APPLICATION', payload: null });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
      <MapHeader 
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={onToggleView}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        <DesktopSidebarSection 
          isMobile={isMobile}
          applications={filteredApplications}
          selectedApplication={selectedApplication}
          postcode={postcode}
          activeFilters={activeFilters}
          activeSort={activeSort}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          onSelectApplication={(id) => dispatch({ type: 'SELECT_APPLICATION', payload: id })}
          onClose={handleClose}
        />
        
        <MapSection 
          isMobile={isMobile}
          isMapView={isMapView}
          coordinates={coordinates}
          applications={filteredApplications}
          selectedId={selectedApplication}
          dispatch={dispatch}
          postcode={postcode}
        />
        
        {isMobile && !isMapView && (
          <MobileListContainer
            applications={filteredApplications}
            selectedApplication={selectedApplication}
            postcode={postcode}
            onSelectApplication={(id) => dispatch({ type: 'SELECT_APPLICATION', payload: id })}
            onShowEmailDialog={() => setShowEmailDialog(true)}
            onClose={handleClose}
          />
        )}
      </div>

      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
        postcode={postcode}
      />
    </div>
  );
};