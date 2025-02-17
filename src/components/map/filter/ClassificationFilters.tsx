
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
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
}

export const ClassificationFilters = ({
  onFilterChange,
  activeFilter,
}: ClassificationFiltersProps) => {
  const filters = [
    {
      label: "Residential",
      value: "residential",
      icon: Building2,
      color: "#af5662",
      description: "Residential properties",
    },
    {
      label: "Commercial",
      value: "commercial",
      icon: Store,
      color: "#8bc5be",
      description: "Commercial properties",
    },
    {
      label: "Industrial",
      value: "industrial",
      icon: Factory,
      color: "#af5662",
      description: "Industrial properties",
    },
    {
      label: "Mixed Use",
      value: "mixed_use",
      icon: Building,
      color: "#8bc5be",
      description: "Mixed use developments",
    },
    {
      label: "Green Space",
      value: "green_space",
      icon: TreePine,
      color: "#af5662",
      description: "Parks and green spaces",
    },
    {
      label: "Religious",
      value: "religious",
      icon: Church,
      color: "#8bc5be",
      description: "Religious buildings",
    },
    {
      label: "Storage",
      value: "storage",
      icon: Warehouse,
      color: "#af5662",
      description: "Storage facilities",
    },
    {
      label: "Other",
      value: "other",
      icon: MapPin,
      color: "#8bc5be",
      description: "Other applications",
    }
  ];

  return (
    <div className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "flex flex-col items-center gap-1 py-2 h-auto min-w-[80px] whitespace-nowrap bg-transparent hover:bg-[#9cd0c9]",
              isActive && "bg-[#7ab0a9] text-primary-foreground"
            )}
            onClick={() => onFilterChange("classification", isActive ? "" : filter.value)}
          >
            <Icon 
              className="h-5 w-5" 
              style={{ color: filter.color }}
            />
            <span className="text-xs font-medium">{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
