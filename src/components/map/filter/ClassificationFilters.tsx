import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, Film, Hammer, Home, House, Trees } from "lucide-react";
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
      label: "High Impact",
      value: "high_impact",
      icon: Award,
      color: "#af5662", // Honeysuckle
      description: "Impact scores above 70",
    },
    {
      label: "Entertainment",
      value: "entertainment",
      icon: Film,
      color: "#8bc5be", // Tiffany Blue
      description: "Entertainment venues",
    },
    {
      label: "Trees",
      value: "trees",
      icon: Trees,
      color: "#af5662", // Honeysuckle
      description: "Tree-related applications",
    },
    {
      label: "Demolition",
      value: "demolition",
      icon: Hammer,
      color: "#8bc5be", // Tiffany Blue
      description: "Demolition works",
    },
    {
      label: "Housing",
      value: "housing",
      icon: House,
      color: "#af5662", // Honeysuckle
      description: "New build houses",
    },
    {
      label: "Extensions",
      value: "home_extension",
      icon: Home,
      color: "#8bc5be", // Tiffany Blue
      description: "Home extensions",
    },
    {
      label: "Landscaping",
      value: "landscaping",
      icon: Trees,
      color: "#af5662", // Honeysuckle
      description: "Landscaping works",
    },
    {
      label: "Other",
      value: "other",
      icon: House,
      color: "#8bc5be", // Tiffany Blue
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