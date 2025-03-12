
import { type SortType, type StatusCounts } from "@/types/application-types";
import { Badge } from "@/components/ui/badge";

interface FilterBadgesProps {
  activeFilters: Record<string, any>;
  activeSort: SortType;
  onFilterChange: (type: string, value: any) => void;
  statusCounts: StatusCounts;
}

export const FilterBadges = ({ 
  activeFilters,
  activeSort,
  onFilterChange,
  statusCounts 
}: FilterBadgesProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
        {activeFilters.status && (
          <Badge 
            variant="secondary" 
            className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 border-0 font-medium cursor-pointer whitespace-nowrap"
            onClick={() => onFilterChange("status", "")}
          >
            {activeFilters.status} ×
          </Badge>
        )}
        {activeFilters.type && (
          <Badge 
            variant="secondary" 
            className="px-4 py-1.5 rounded-full bg-gray-50 text-gray-900 hover:bg-gray-100 border-0 font-medium cursor-pointer whitespace-nowrap"
            onClick={() => onFilterChange("type", "")}
          >
            {activeFilters.type} ×
          </Badge>
        )}
      </div>
    </div>
  );
};
