
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
  // Use the useIsMobile hook directly to get a more accurate reading
  const reallyIsMobile = useIsMobile();

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex justify-between items-center gap-2">
        <ErrorBoundary>
          <StatusFilter
            onFilterChange={onFilterChange}
            activeFilters={activeFilters}
            isMobile={reallyIsMobile}
            applications={applications}
            statusCounts={statusCounts}
          />
        </ErrorBoundary>

        <div className="flex items-center gap-2">
          <ErrorBoundary>
            {reallyIsMobile && isMapView ? (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap"
                onClick={onToggleView}
              >
                <List className="h-3.5 w-3.5" />
                Feed
              </Button>
            ) : (
              <SortDropdown
                activeSort={activeSort}
                onSortChange={onSortChange}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      <div className={`w-full ${reallyIsMobile ? 'overflow-x-auto scrollbar-hide -mx-1 px-1' : 'overflow-hidden'}`}>
        <ClassificationFilters 
          onFilterChange={onFilterChange}
          activeFilter={activeFilters.classification}
        />
      </div>
    </div>
  );
};
