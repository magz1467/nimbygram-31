import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterBar } from "../FilterBar";
import { MapListToggle } from "./mobile/MapListToggle";
import { PostcodeSearch } from "../PostcodeSearch";

interface MapHeaderProps {
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: 'closingSoon' | 'newest' | null) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: 'closingSoon' | 'newest' | null;
  isMapView?: boolean;
  onToggleView?: () => void;
}

export const MapHeader = ({ 
  onFilterChange, 
  onSortChange,
  activeFilters = {}, 
  activeSort = null,
  isMapView = true, 
  onToggleView 
}: MapHeaderProps) => {
  const [postcode, setPostcode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim()) {
      if (location.pathname === '/map') {
        navigate('/map', { 
          state: { postcode: postcode.trim() }, 
          replace: true 
        });
      } else {
        navigate('/map', { 
          state: { postcode: postcode.trim() } 
        });
      }
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
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1">
          <PostcodeSearch
            onSelect={setPostcode}
            placeholder="Search new location"
          />
        </form>

        {isMobile && onFilterChange && onToggleView && (
          <div className="flex items-center justify-between mt-3 border-t pt-2">
            <div className="flex items-center gap-1">
              <FilterBar
                onFilterChange={onFilterChange}
                onSortChange={onSortChange}
                activeFilters={activeFilters}
                activeSort={activeSort}
              />
              <MapListToggle
                isMapView={isMapView}
                onToggle={onToggleView}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};