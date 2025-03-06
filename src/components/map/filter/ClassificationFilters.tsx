
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
  MapPin,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClassificationFiltersProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilter?: string;
}

export const ClassificationFilters = ({
  onFilterChange,
  activeFilter,
}: ClassificationFiltersProps) => {
  const isMobile = useIsMobile();
  const [scrollPosition, setScrollPosition] = useState(0);
  
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

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('filter-scroll-container');
    if (!container) return;
    
    const scrollAmount = 200; // Adjust scroll amount as needed
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  return (
    <div className="relative flex items-center w-full">
      {isMobile && scrollPosition > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 h-8 w-8 rounded-full bg-white/80 shadow-sm"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        id="filter-scroll-container"
        className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hide w-full snap-x scroll-smooth"
        style={{ 
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.value;
          
          return (
            <Button
              key={filter.value}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center gap-1 py-2 h-auto min-w-[80px] whitespace-nowrap bg-transparent hover:bg-[#9cd0c9] snap-start",
                isActive && "bg-[#7ab0a9] text-primary-foreground",
                isMobile && "min-w-[70px] px-2"
              )}
              onClick={() => onFilterChange("classification", isActive ? "" : filter.value)}
            >
              <Icon 
                className="h-5 w-5" 
                style={{ color: filter.color }}
              />
              <span className={cn("text-xs font-medium", isMobile && "text-[10px]")}>{filter.label}</span>
            </Button>
          );
        })}
      </div>
      
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 h-8 w-8 rounded-full bg-white/80 shadow-sm"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
