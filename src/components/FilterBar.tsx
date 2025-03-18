
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewToggle } from "./map/filter/ViewToggle";
import { FilterControls } from "./map/filter/FilterControls";
import { SortType } from "@/types/application-types";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { useMapViewStore } from "../store/mapViewStore";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MapToggleButton } from "./MapToggleButton";

interface FilterBarProps {
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: string;
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
  activeFilters = { status: 'All', type: 'All', classification: 'All' },
  activeSort = 'distance',
  isMapView = false,
  onToggleView,
  applications = [],
  statusCounts = { 'Under Review': 0, 'Approved': 0, 'Declined': 0, 'Other': 0 }
}: FilterBarProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { setMapView } = useMapViewStore();
  
  const handleSortChange = useCallback((sortType: SortType) => {
    if (onSortChange) {
      onSortChange(sortType);
    }
  }, [onSortChange]);

  return (
    <div className="bg-white border-b p-3 flex items-center justify-between">
      {/* Desktop view */}
      {!isMobile && (
        <>
          <div className="flex items-center gap-2">
            <FilterControls 
              onFilterChange={onFilterChange} 
              activeFilters={activeFilters}
              statusCounts={statusCounts}
              onSortChange={handleSortChange}
              activeSort={activeSort as SortType}
            />
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle 
              isMapView={isMapView} 
              onToggleView={() => {
                console.log("ViewToggle clicked, setting map view to", !isMapView);
                setMapView(!isMapView);
              }} 
            />
          </div>
        </>
      )}
      
      {/* Mobile view */}
      {isMobile && (
        <div className="flex items-center gap-2 w-full">
          {/* Map toggle button - REPLACED WITH OUR CUSTOM COMPONENT */}
          <MapToggleButton className="flex-1" />
          
          {/* Filter button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 flex-1"
            onClick={() => {
              if (onFilterChange) {
                onFilterChange('status', activeFilters.status === 'All' ? '' : 'All');
              }
            }}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          
          {/* Distance/sort button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 flex-1"
            onClick={() => handleSortChange('distance')}
          >
            <ArrowUpDown className="h-4 w-4" />
            Distance
          </Button>
        </div>
      )}
    </div>
  );
};
