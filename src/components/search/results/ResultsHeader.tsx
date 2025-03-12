
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterControls } from "@/components/map/filter/FilterControls";
import { SortType } from "@/types/application-types";
import { ViewToggle } from "@/components/map/filter/ViewToggle";

interface ResultsHeaderProps {
  searchTerm: string;
  resultCount: number;
  isMapVisible?: boolean;
  onToggleMapView?: () => void;
  isLoading?: boolean;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
  activeSort: SortType;
  activeFilters: {
    status?: string;
    type?: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
}

export const ResultsHeader = ({
  searchTerm,
  resultCount,
  isMapVisible,
  onToggleMapView,
  isLoading = false,
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  },
  activeSort,
  activeFilters,
  onFilterChange,
  onSortChange
}: ResultsHeaderProps) => {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Reset filter visibility when search term changes
  useEffect(() => {
    setShowFilters(false);
  }, [searchTerm]);

  // Don't show "Current Applications" for empty searches
  if (!searchTerm) {
    return (
      <div className="px-4 py-3 bg-white border-b">
        <h1 className="text-xl font-semibold">Current Applications</h1>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-3 bg-white border-b">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {isLoading ? (
                <span className="text-muted-foreground">Searching...</span>
              ) : (
                <>
                  {resultCount} {resultCount === 1 ? 'result' : 'results'} for <span className="font-bold">{searchTerm}</span>
                </>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Finding planning applications..."
                : resultCount > 0
                ? `Showing ${resultCount} planning applications near ${searchTerm}`
                : "No planning applications found in this area"}
            </p>
          </div>
          
          {!isMobile && onToggleMapView && (
            <ViewToggle 
              isMapView={!!isMapVisible} 
              onToggleView={onToggleMapView}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="w-full overflow-x-auto hide-scrollbar">
            <FilterControls
              onFilterChange={onFilterChange}
              onSortChange={onSortChange}
              activeFilters={activeFilters}
              activeSort={activeSort}
              isMobile={isMobile}
              applications={[]}
              statusCounts={statusCounts}
              isMapView={!!isMapVisible}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
