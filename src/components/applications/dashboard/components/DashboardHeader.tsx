
import { FilterBar } from "@/components/FilterBar";
import { SortType } from "@/types/application-types";

interface DashboardHeaderProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
  isMapView: boolean;
  onToggleView: () => void;
}

export const DashboardHeader = ({
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  isMapView,
  onToggleView
}: DashboardHeaderProps) => {
  // Initialize a default statusCounts object
  const statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  };

  return (
    <div className="border-b bg-white">
      <FilterBar 
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={onToggleView}
        statusCounts={statusCounts}
      />
    </div>
  );
};
