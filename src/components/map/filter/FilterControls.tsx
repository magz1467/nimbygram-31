
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StatusFilter } from "./StatusFilter"; 
import { SortDropdown } from "./SortDropdown"; 
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { ClassificationFilters } from "./ClassificationFilters";
import { SortType, FilterType, StatusCounts } from "@/types/application-types";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterControlsProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  activeFilters: FilterType;
  activeSort: SortType;
  isMobile: boolean;
  applications?: any[];
  isMapView: boolean;
  onToggleView?: () => void;
  statusCounts?: StatusCounts;
}

export const FilterControls = ({
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  isMobile,
  applications,
  isMapView,
  onToggleView,
  statusCounts
}: FilterControlsProps) => {
  const sortButtonText = (() => {
    if (activeSort === 'closingSoon') return 'Closing Soon';
    if (activeSort === 'newest') return 'Newest';
    if (activeSort === 'impact') return 'Highest Impact';
    return 'Sort';
  })();

  // Use the useIsMobile hook directly to get a more accurate reading
  const reallyIsMobile = useIsMobile();

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center gap-1.5 flex-nowrap">
        <ErrorBoundary>
          <StatusFilter
            onFilterChange={onFilterChange}
            activeFilters={activeFilters}
            isMobile={reallyIsMobile}
            applications={applications}
            statusCounts={statusCounts}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          {reallyIsMobile && isMapView ? (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 whitespace-nowrap"
              onClick={onToggleView}
            >
              <List className="h-4 w-4" />
              Feed
            </Button>
          ) : (
            <SortDropdown
              activeSort={activeSort}
              onSortChange={onSortChange}
            >
              <Button
                variant="outline"
                size={reallyIsMobile ? "sm" : "default"}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                {sortButtonText}
              </Button>
            </SortDropdown>
          )}
        </ErrorBoundary>
      </div>

      <div className="w-full overflow-hidden">
        <ClassificationFilters 
          onFilterChange={onFilterChange}
          activeFilter={activeFilters.classification}
        />
      </div>
    </div>
  );
};
