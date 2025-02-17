
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassificationFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilter?: string;
  categories?: string[];
}

export const ClassificationFilters = ({
  onFilterChange,
  activeFilter,
  categories = [],
}: ClassificationFiltersProps) => {
  const handleSelect = (category: string) => {
    onFilterChange('classification', category);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap",
            activeFilter && "border-primary text-primary"
          )}
        >
          <Building2 className="h-4 w-4" />
          {activeFilter || "Categories"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onFilterChange('classification', '')}
        >
          All Categories
          {!activeFilter && <span>✓</span>}
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            className="justify-between"
            onClick={() => handleSelect(category)}
          >
            {category}
            {activeFilter === category && <span>✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
