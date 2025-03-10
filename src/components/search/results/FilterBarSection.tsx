
import { FilterBar } from "@/components/FilterBar";
import { StatusCounts, SortType } from "@/types/application-types";
import { Application } from "@/types/planning";
import { useIsMobile } from "@/hooks/use-mobile";

// This component is kept for backward compatibility but we're now using the filters
// directly in the ResultsHeader component

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
  
  // This component is now deprecated as filters are shown in the header
  return null;
};
