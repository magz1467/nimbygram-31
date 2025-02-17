
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Home, 
  Store, 
  Factory, 
  Building, 
  TreePine,
  Church,
  Warehouse,
  School,
  Hotel,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassificationFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilter?: string;
  categories?: string[];
}

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Residential': <Home className="h-4 w-4" />,
    'Commercial': <Store className="h-4 w-4" />,
    'Industrial': <Factory className="h-4 w-4" />,
    'Mixed Use': <Building className="h-4 w-4" />,
    'Green Space': <TreePine className="h-4 w-4" />,
    'Religious': <Church className="h-4 w-4" />,
    'Storage': <Warehouse className="h-4 w-4" />,
    'Educational': <School className="h-4 w-4" />,
    'Hospitality': <Hotel className="h-4 w-4" />,
  };

  return iconMap[category] || <MapPin className="h-4 w-4" />;
};

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
      <DropdownMenuContent align="start" className="w-[200px] bg-white">
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onFilterChange('classification', '')}
        >
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            All Categories
          </span>
          {!activeFilter && <span>✓</span>}
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            className="justify-between"
            onClick={() => handleSelect(category)}
          >
            <span className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {category}
            </span>
            {activeFilter === category && <span>✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
