
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewToggle } from "./map/filter/ViewToggle";
import { FilterControls } from "./map/filter/FilterControls";
import { SortType } from "@/types/application-types";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Map, List, Filter, ArrowUpDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleMapToggle = useCallback(() => {
    // Check if we're currently on the map page
    const isOnMapPage = location.pathname === '/map';
    
    if (isOnMapPage) {
      // If on map page, go back to search results, preserving the search state
      const searchParams = new URLSearchParams(location.search);
      const postcode = searchParams.get('postcode');
      
      // Navigate with state to preserve application data
      navigate(`/search-results${postcode ? `?postcode=${postcode}` : ''}`, {
        state: {
          ...location.state, // Preserve existing state
          fromMap: true // Mark that we're coming from map view
        }
      });
    } else {
      // If not on map page, go to map with application data
      const searchParams = new URLSearchParams(location.search);
      const postcode = searchParams.get('postcode');
      
      // Navigate with state to ensure applications are preserved
      navigate(`/map${postcode ? `?postcode=${postcode}` : ''}`, {
        state: {
          ...location.state, // Preserve existing state
          applications: applications, // Pass along applications
          fromList: true // Mark that we're coming from list view
        }
      });
    }
  }, [navigate, location, applications]);

  return (
    <div className="flex flex-col bg-white border-b w-full">
      <div className="px-4 pb-2 flex items-center gap-2">
        {/* Map/List toggle button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMapToggle}
          className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
        >
          {location.pathname === '/map' ? (
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
