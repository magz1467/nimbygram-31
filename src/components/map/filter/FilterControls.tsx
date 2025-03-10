
import { useIsMobile } from "@/hooks/use-mobile";
import { SortDropdown } from "./SortDropdown";
import { FilterDropdown } from "./FilterDropdown";
import { ClassificationFilters } from "./ClassificationFilters";
import { StatusFilter } from "./StatusFilter";
import { SortType } from "@/types/application-types";
import { useCallback } from "react";

interface FilterControlsProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: SortType;
  isMobile?: boolean;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  isMapView?: boolean;
  onToggleView?: () => void;
  showCategoryFiltersOnly?: boolean;
}

export const FilterControls = ({
  onFilterChange,
  onSortChange,
  activeFilters = {},
  activeSort,
  isMobile: forceMobile,
  applications = [],
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  },
  isMapView,
  onToggleView,
  showCategoryFiltersOnly = false
}: FilterControlsProps) => {
  const isMobileDetected = useIsMobile();
  const isMobile = forceMobile !== undefined ? forceMobile : isMobileDetected;

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    onFilterChange(filterType, value);
  }, [onFilterChange]);

  const handleSortChange = useCallback((sortType: SortType) => {
    onSortChange(sortType);
  }, [onSortChange]);

  // If we only want to show category filters, render just those
  if (showCategoryFiltersOnly) {
    return (
      <div className="flex items-center space-x-2 w-full overflow-x-auto hide-scrollbar">
        <ClassificationFilters 
          onFilterChange={handleFilterChange} 
          activeClassification={activeFilters.classification} 
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${isMobile ? 'w-full overflow-x-auto hide-scrollbar' : ''}`}>
      <FilterDropdown 
        onFilterChange={handleFilterChange} 
        activeFilters={activeFilters} 
        statusCounts={statusCounts}
        isMobile={isMobile}
      />
      
      <SortDropdown 
        onSortChange={handleSortChange} 
        activeSort={activeSort} 
        isMobile={isMobile}
      />
      
      <ClassificationFilters 
        onFilterChange={handleFilterChange} 
        activeClassification={activeFilters.classification} 
        isMobile={isMobile}
      />

      {applications.length > 0 && (
        <StatusFilter 
          onFilterChange={handleFilterChange}
          activeStatus={activeFilters.status || ''}
          statusCounts={statusCounts}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};
