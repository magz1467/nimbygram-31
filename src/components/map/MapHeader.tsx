
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterBar } from "../FilterBar";

interface MapHeaderProps {
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: 'closingSoon' | 'newest' | 'distance' | null) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: 'closingSoon' | 'newest' | 'distance' | null;
  isMapView?: boolean;
  onToggleView?: () => void;
  applications?: any[];
}

export const MapHeader = ({ 
  onFilterChange, 
  onSortChange,
  activeFilters = {}, 
  activeSort = null,
  isMapView = true, 
  onToggleView,
  applications = []
}: MapHeaderProps) => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('postcode') || '';
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleListViewClick = () => {
    // Navigate back to search results with the current parameters and state
    if (initialSearch) {
      // Use the same search parameter format as Header.tsx
      navigate(`/search-results?search=${encodeURIComponent(initialSearch.trim())}&timestamp=${Date.now()}`, {
        state: {
          ...location.state, // Preserve other state
          searchTerm: initialSearch.trim(),
          applications: applications, // Pass the current applications
          fromMap: true // Mark as coming from map
        }
      });
    } else {
      navigate('/search-results', {
        state: {
          ...location.state,
          applications: applications,
          fromMap: true
        }
      });
    }
  };

  return (
    <div className="border-b bg-white">
      <div className={`container mx-auto ${isMobile ? 'p-3' : 'px-4 py-3'}`}>
        <div className="flex items-center justify-between">
          {/* Add List View button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleListViewClick}
            className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
          
          {isMobile && (
            <div className="flex items-center gap-1">
              {onFilterChange && (
                <FilterBar
                  onFilterChange={onFilterChange}
                  onSortChange={onSortChange}
                  activeFilters={activeFilters}
                  activeSort={activeSort || 'distance'}
                  isMapView={true}
                  applications={applications}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
