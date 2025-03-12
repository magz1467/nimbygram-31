
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterDropdownProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilters: {
    status?: string;
    type?: string;
    date?: string;
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
  const [date, setDate] = useState<Date | undefined>(
    activeFilters.date ? new Date(activeFilters.date) : undefined
  );

  const hasActiveFilters = useMemo(() => 
    Object.values(activeFilters).some(Boolean), 
    [activeFilters]
  );

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    onFilterChange(filterType, value);
  }, [onFilterChange]);

  const handleDateChange = useCallback((selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD for consistency with database format
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onFilterChange("date", formattedDate);
    } else {
      onFilterChange("date", "");
    }
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange("status", "");
    onFilterChange("type", "");
    onFilterChange("date", "");
    setDate(undefined);
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
        
        {/* Status filter section */}
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
        
        <DropdownMenuSeparator />
        
        {/* Date filter section */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="justify-between">
            <span>Date filter</span>
            {activeFilters.date && <span className="text-xs">Since {activeFilters.date}</span>}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="p-0 z-[99999]">
            <div className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="p-3 pointer-events-auto border rounded-md"
                initialFocus
              />
              {activeFilters.date && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => handleDateChange(undefined)}
                >
                  Clear date filter
                </Button>
              )}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

FilterDropdown.displayName = 'FilterDropdown';
