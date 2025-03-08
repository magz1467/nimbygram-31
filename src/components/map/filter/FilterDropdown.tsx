
import { memo, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilters: {
    status?: string;
    type?: string;
  };
  isMobile?: boolean;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

const statusOptions = [
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Declined", value: "Declined" },
];

export const FilterDropdown = memo(({
  onFilterChange,
  activeFilters = {},
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  }
}: FilterDropdownProps) => {
  const hasActiveFilters = useMemo(() => 
    Object.values(activeFilters).some(Boolean), 
    [activeFilters]
  );

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    onFilterChange(filterType, value);
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange("status", "");
    onFilterChange("type", "");
  }, [onFilterChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "px-3",
            hasActiveFilters && "border-primary text-primary"
          )}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start"
        className="w-[200px] bg-white z-[9999]"
      >
        {hasActiveFilters && (
          <>
            <DropdownMenuItem onClick={handleClearFilters}>
              Clear all filters
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => handleFilterChange("status", "")}
          className="justify-between"
        >
          All statuses
          {!activeFilters.status && <span>✓</span>}
        </DropdownMenuItem>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleFilterChange("status", option.value)}
            className="justify-between"
          >
            {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
            {activeFilters.status === option.value && <span>✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

FilterDropdown.displayName = 'FilterDropdown';
