import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { DesktopSidebar } from "@/components/map/DesktopSidebar";
import { MobileMapControls } from "@/components/map/mobile/MobileMapControls";
import { MobileListDetailsView } from "@/components/map/mobile/MobileListDetailsView";
import { MobileApplicationCards } from "@/components/map/mobile/MobileApplicationCards";

interface SidebarSectionProps {
  isMobile: boolean;
  isMapView: boolean;
  applications: Application[];
  selectedId: number | null;
  postcode: string;
  coordinates: [number, number];
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  onSelectApplication: (id: number | null) => void;
  onClose: () => void;
}

export const SidebarSection = ({
  isMobile,
  isMapView,
  applications,
  selectedId,
  postcode,
  coordinates,
  activeFilters,
  activeSort,
  onFilterChange,
  onSortChange,
  onSelectApplication,
  onClose,
}: SidebarSectionProps) => {
  if (isMobile) {
    return isMapView ? (
      <div className="flex flex-col h-full">
        <MobileMapControls
          selectedId={selectedId}
          applications={applications}
          onSelectApplication={onSelectApplication}
        />
        <MobileApplicationCards
          applications={applications}
          selectedId={selectedId}
          onSelectApplication={onSelectApplication}
        />
      </div>
    ) : (
      <MobileListDetailsView
        applications={applications}
        selectedId={selectedId}
        postcode={postcode}
        activeFilters={activeFilters}
        activeSort={activeSort}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onSelectApplication={onSelectApplication}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="w-96 flex-shrink-0 border-r overflow-hidden">
      <DesktopSidebar
        applications={applications}
        selectedApplication={selectedId}
        postcode={postcode}
        activeFilters={activeFilters}
        activeSort={activeSort}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onSelectApplication={onSelectApplication}
        onClose={onClose}
      />
    </div>
  );
};
