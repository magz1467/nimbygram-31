
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewToggle } from "./map/filter/ViewToggle";
import { FilterControls } from "./map/filter/FilterControls";
import { SortType } from "@/types/application-types";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Map, List, Filter, ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: SortType;
  isMapView?: boolean;
  onToggleView?: () => void;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export const FilterBar = ({
  onFilterChange,
  onSortChange,
  activeFilters = {},
  activeSort,
  isMapView,
  onToggleView,
  applications = [],
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  }
}: FilterBarProps) => {
  const isMobile = useIsMobile();

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  }, [onFilterChange]);

  const handleSortChange = useCallback((sortType: SortType) => {
    if (onSortChange) {
      onSortChange(sortType);
    }
  }, [onSortChange]);

  return (
    <div className="flex flex-col bg-white border-b w-full">
      <div className="px-4 pb-2 flex items-center gap-2">
        {/* Map/List toggle button */}
        {onToggleView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleView}
            className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
          >
            {isMapView ? (
              <>
                <List className="h-4 w-4" />
                List
              </>
            ) : (
              <>
                <Map className="h-4 w-4" />
                Map
              </>
            )}
          </Button>
        )}
        
        {/* Filter button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={() => {/* Add filter action here if needed */}}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        
        {/* Distance/sort button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={() => handleSortChange('distance')}
        >
          <ArrowUpDown className="h-4 w-4" />
          Distance
        </Button>
      </div>
      
      {/* Additional filter controls can go here */}
      <div className={`flex items-center justify-between p-1.5 w-full ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
        <FilterControls 
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          isMobile={isMobile}
          applications={applications}
          statusCounts={statusCounts}
          isMapView={isMapView || false}
          onToggleView={onToggleView}
        />
      </div>
    </div>
  );
};
