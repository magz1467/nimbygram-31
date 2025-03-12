
import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, MapPin, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortType, StatusCounts } from "@/types/application-types";
import { SearchBar } from "@/components/search/SearchBar";

// Lazy load filter components for better performance
const FilterBadges = lazy(() => import("@/components/filter/FilterBadges").then(mod => ({ default: mod.FilterBadges })));

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
}: ResultsHeaderProps) => {
  const hasFilters =
    activeFilters.status ||
    activeFilters.type ||
    activeSort !== "distance";

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="container max-w-4xl mx-auto pt-4 pb-2 px-4">
        <div className="mb-4">
          <SearchBar variant="compact" className="w-full" />
        </div>
        
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-base font-medium text-gray-900 flex items-center">
              <MapPin className="inline-block w-4 h-4 mr-1 text-primary" />
              {searchTerm}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading
                ? "Searching for applications..."
                : `${resultCount} planning application${
                    resultCount !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onToggleMapView}
            >
              {isMapVisible ? (
                <>
                  <List className="w-4 h-4 mr-1" />
                  List
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-1" />
                  Map
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <span className="mr-1">Sort</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className={
                    activeSort === "distance" ? "bg-gray-100 font-medium" : ""
                  }
                  onClick={() => onSortChange("distance")}
                >
                  Nearest first
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={
                    activeSort === "date" ? "bg-gray-100 font-medium" : ""
                  }
                  onClick={() => onSortChange("date")}
                >
                  Most recent
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={
                    activeSort === "impact" ? "bg-gray-100 font-medium" : ""
                  }
                  onClick={() => onSortChange("impact")}
                >
                  Highest impact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Suspense fallback={<div className="h-10"></div>}>
          <FilterBadges
            activeFilters={activeFilters}
            activeSort={activeSort}
            onFilterChange={onFilterChange}
            statusCounts={statusCounts}
          />
        </Suspense>

        <Separator className="mt-2" />
      </div>
    </div>
  );
};
