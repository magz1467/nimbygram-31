import { FilterBar } from "@/components/FilterBar";
import { PostcodeSearch } from "@/components/PostcodeSearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchSectionProps {
  onPostcodeSelect: (postcode: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: 'closingSoon' | 'newest' | null) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  activeSort?: 'closingSoon' | 'newest' | null;
  isMapView: boolean;
  onToggleView?: () => void;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export const SearchSection = ({
  onPostcodeSelect,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  isMapView,
  onToggleView,
  applications,
  statusCounts,
}: SearchSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <PostcodeSearch
          onSelect={onPostcodeSelect}
          placeholder="Search new location"
        />
      </div>

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