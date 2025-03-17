import { Button } from "@/components/ui/button";
import { SortType, StatusCounts } from "@/types/application-types";
import { Map, List, Filter, ArrowUpDown } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { ReactNode } from "react";

interface ResultsHeaderProps {
  searchTerm: string;
  resultCount: number;
  isLoading: boolean;
  isMapVisible: boolean;
  onToggleMapView: () => void;
  activeSort: SortType;
  activeFilters: Record<string, any>;
  onFilterChange: (type: string, value: any) => void;
  onSortChange: (sortType: SortType) => void;
  statusCounts: StatusCounts;
  extraControls?: ReactNode;
}

export const ResultsHeader = ({
  searchTerm,
  resultCount,
  isLoading,
  isMapVisible,
  onToggleMapView,
  activeSort,
  activeFilters,
  onFilterChange,
  onSortChange,
  statusCounts,
  extraControls
}: ResultsHeaderProps) => {
  return (
    <div className="sticky top-0 bg-white z-10 border-b">
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h1 className="text-xl font-bold">
            {resultCount} planning applications found
          </h1>
          <p className="text-sm text-gray-500">
            {searchTerm ? `Near ${searchTerm}` : 'Recent applications'}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleMapView}
          className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
        >
          {isMapVisible ? (
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
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <ArrowUpDown className="h-4 w-4" />
          Distance
        </Button>
        
        {extraControls}
      </div>
      
      <FilterBar
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapVisible}
        onToggleView={onToggleMapView}
        statusCounts={statusCounts}
      />
    </div>
  );
};
