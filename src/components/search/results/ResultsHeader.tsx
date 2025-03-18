import { Button } from "@/components/ui/button";
import { SortType, StatusCounts } from "@/types/application-types";
import { Map, List, Filter, ArrowUpDown } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { ReactNode } from "react";

interface ResultsHeaderProps {
  searchTerm?: string;
  resultCount: number;
  isLoading: boolean;
  isMapVisible: boolean;
  onToggleMapView: () => void;
  activeSort: SortType;
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
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
      
      {/* Only use the FilterBar, which now contains all the buttons */}
      <FilterBar
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapVisible}
        onToggleView={onToggleMapView}
        statusCounts={statusCounts}
      />
      
      {/* If there are extra controls, render them after the FilterBar */}
      {extraControls && (
        <div className="px-4 py-2">
          {extraControls}
        </div>
      )}
    </div>
  );
};
