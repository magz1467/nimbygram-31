
import { FilterBar } from "@/components/FilterBar";
import { PostcodeSearch } from "@/components/postcode/PostcodeSearch";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortType } from "@/types/application-types";
import { useLocation } from "react-router-dom";

interface SearchSectionProps {
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  onPostcodeSelect: (postcode: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: SortType;
  isMapView?: boolean;
  onToggleView?: () => void;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  isLoading?: boolean;
}

export const SearchSection = ({
  searchTerm,
  setSearchTerm,
  onPostcodeSelect,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  isMapView,
  onToggleView,
  applications,
  statusCounts,
  isLoading
}: SearchSectionProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Skip rendering the search section on pages that already have a search in the header
  const shouldSkipSearch = ["/map", "/search-results"].some(path => 
    location.pathname.includes(path)
  );
  
  if (shouldSkipSearch) {
    return null;
  }

  return (
    <div className="bg-white border-b">
      {isMobile && (
        <div className="container mx-auto px-4 py-3">
          <PostcodeSearch
            onSelect={onPostcodeSelect}
            placeholder="Search new location"
          />
        </div>
      )}

      {onFilterChange && (
        <div className="w-full border-t">
          <div className="container mx-auto px-4 py-2">
            <FilterBar 
              onFilterChange={onFilterChange}
              onSortChange={onSortChange}
              activeFilters={activeFilters}
              activeSort={activeSort}
              applications={applications}
              statusCounts={statusCounts}
            />
          </div>
        </div>
      )}
    </div>
  );
};
