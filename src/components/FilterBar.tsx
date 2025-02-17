
import { ViewToggle } from "@/components/map/filter/ViewToggle";
import { FilterControls } from "@/components/map/filter/FilterControls";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterBarProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: 'closingSoon' | 'newest' | null;
  applications?: any[];
  categories?: string[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  isMapView?: boolean;
  onToggleView?: () => void;
}

export const FilterBar = ({
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  applications,
  categories,
  statusCounts,
  isMapView,
  onToggleView,
}: FilterBarProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2 justify-between">
      <FilterControls
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMobile={isMobile}
        applications={applications}
        isMapView={isMapView || false}
        onToggleView={onToggleView}
        statusCounts={statusCounts}
        categories={categories}
      />
      {onToggleView && (
        <ViewToggle
          isMapView={isMapView || false}
          onToggleView={onToggleView}
        />
      )}
    </div>
  );
};
