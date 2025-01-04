import { Application } from "@/types/planning";
import { DesktopSidebar } from "@/components/map/DesktopSidebar";
import { MobileListContainer } from "@/components/map/mobile/MobileListContainer";

interface SidebarContentProps {
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
  activeSort: 'closingSoon' | 'newest' | null;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  onSelectApplication: (id: number | null) => void;
  onClose: () => void;
}

export const SidebarContent = ({
  isMobile,
  isMapView,
  applications,
  selectedId,
  postcode,
  coordinates,
  activeFilters,
  activeSort,
  statusCounts,
  onFilterChange,
  onSortChange,
  onSelectApplication,
  onClose,
}: SidebarContentProps) => {
  if (!coordinates) return null;

  if (!isMobile) {
    return (
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
        statusCounts={statusCounts}
      />
    );
  }

  if (!isMapView) {
    return (
      <MobileListContainer
        applications={applications}
        selectedApplication={selectedId}
        postcode={postcode}
        onSelectApplication={onSelectApplication}
        onShowEmailDialog={() => {}}
        hideFilterBar={true}
        onClose={onClose}
      />
    );
  }

  return null;
};