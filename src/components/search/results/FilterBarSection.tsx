
import { FilterBar } from "@/components/FilterBar";
import { StatusCounts, SortType } from "@/types/application-types";
import { Application } from "@/types/planning";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterBarSectionProps {
  coordinates: [number, number] | null;
  hasSearched: boolean;
  isLoading: boolean;
  applications: Application[];
  activeFilters: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: SortType;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: SortType) => void;
  statusCounts: StatusCounts;
}

export const FilterBarSection = ({
  activeFilters,
  activeSort,
  onFilterChange,
  onSortChange,
  coordinates,
  hasSearched,
  isLoading,
  applications,
  statusCounts
}: FilterBarSectionProps) => {
  const isMobile = useIsMobile();
  
  // Always show the filter bar if we have coordinates, even with no applications
  if (coordinates) {
    return (
      <div className="w-full overflow-hidden">
        <FilterBar
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          applications={applications}
          statusCounts={statusCounts}
          isMapView={false}
        />
      </div>
    );
  }

  if (!isLoading && !hasSearched) {
    return (
      <div className="p-4 text-center w-full">
        <h2 className={`text-xl font-semibold text-primary ${isMobile ? 'text-lg' : ''}`}>
          Interesting Planning Applications Across the UK
        </h2>
        <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
          Search above to find planning applications in your area
        </p>
      </div>
    );
  }

  return null;
};
