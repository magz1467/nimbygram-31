import { useIsMobile } from "@/hooks/use-mobile";
import { ViewToggle } from "./map/filter/ViewToggle";
import { FilterControls } from "./map/filter/FilterControls";
import { SortType } from "@/types/application-types";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Map, List, Filter, ArrowUpDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMapViewStore } from "../store/mapViewStore";
import { useMediaQuery } from "../hooks/useMediaQuery";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { isMapView: mapViewStore, setMapView } = useMapViewStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

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

  const handleMapToggle = () => {
    console.log("Map toggle clicked in FilterBar");
    setMapView(!mapViewStore);
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      {/* Sort options and other filter controls */}
      <div>
        {/* Map toggle button - only visible on mobile */}
        {!isDesktop && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMapToggle}
            className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
            data-testid="map-toggle-button"
          >
            {mapViewStore ? (
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
          onClick={() => {
            // We could trigger a modal/dropdown here for filters
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
          className="flex items-center gap-1.5"
          onClick={() => handleSortChange('distance')}
        >
          <ArrowUpDown className="h-4 w-4" />
          Distance
        </Button>
      </div>
    </div>
  );
};
