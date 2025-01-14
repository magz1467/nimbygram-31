import { Button } from "@/components/ui/button";
import { FilterDropdown } from "./FilterDropdown";
import { SortDropdown } from "./SortDropdown";
import { ViewToggle } from "./ViewToggle";
import { StatusFilter } from "./StatusFilter";
import { SortType } from "@/hooks/use-sort-applications";
import { Application } from "@/types/planning";
import { memo } from "react";

interface FilterBarContentProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
  isMapView?: boolean;
  onToggle?: () => void;
  applications?: Application[];
  isMobile?: boolean;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export const FilterBarContent = memo(({
  activeFilters,
  activeSort,
  isMapView,
  onFilterChange,
  onSortChange,
  onToggle,
  applications = [],
  isMobile = false,
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  }
}: FilterBarContentProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b">
      <div className="flex-1 flex items-center gap-2">
        <StatusFilter 
          onFilterChange={(status) => onFilterChange('status', status)}
          activeFilters={activeFilters}
          statusCounts={statusCounts}
          isMobile={isMobile}
          applications={applications}
        />
        <FilterDropdown 
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          applications={applications}
          isMobile={isMobile}
          statusCounts={statusCounts}
        >
          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            Filter
          </Button>
        </FilterDropdown>
        <SortDropdown
          activeSort={activeSort}
          onSortChange={onSortChange}
        />
      </div>
      {onToggle && (
        <ViewToggle 
          isMapView={isMapView}
          onToggle={onToggle}
        />
      )}
    </div>
  );
});

FilterBarContent.displayName = 'FilterBarContent';