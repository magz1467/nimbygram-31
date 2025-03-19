
import { Button } from "@/components/ui/button";
import { Home, List } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterBar } from "../FilterBar";
import { MapListToggle } from "./mobile/MapListToggle";
import { PostcodeSearch } from "../PostcodeSearch";

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
  const initialPostcode = searchParams.get('postcode') || '';
  const [postcode, setPostcode] = useState(initialPostcode);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim()) {
      if (location.pathname === '/map') {
        navigate(`/map?postcode=${encodeURIComponent(postcode.trim())}`, { replace: true });
      } else {
        navigate(`/map?postcode=${encodeURIComponent(postcode.trim())}`);
      }
    }
  };

  const handleListViewClick = () => {
    // Navigate back to search results with the current postcode and state
    if (postcode) {
      navigate(`/search-results?postcode=${encodeURIComponent(postcode.trim())}`, {
        state: {
          ...location.state, // Preserve other state
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
    <header className="border-b bg-white">
      <div className={`container mx-auto ${isMobile ? 'p-3' : 'px-4 py-3'}`}>
        {!isMobile && (
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <Home className="h-6 w-6" />
              PlanningPulse
            </Link>
            
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
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1">
          <PostcodeSearch
            onSelect={setPostcode}
            placeholder="Search new location"
            initialValue={postcode}
          />
        </form>

        {isMobile && (
          <div className="flex items-center justify-between mt-3 border-t pt-2">
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
              
              {/* Add List View button for mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleListViewClick}
                className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
