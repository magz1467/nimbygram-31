
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortType } from "@/types/application-types";
import { SortAsc } from "lucide-react";

interface SortDropdownProps {
  children?: React.ReactNode;
  activeSort: SortType;
  onSortChange: (sortType: SortType) => void;
  showDistanceSort?: boolean;
}

export const SortDropdown = ({ 
  children, 
  activeSort, 
  onSortChange, 
  showDistanceSort = false 
}: SortDropdownProps) => {
  // Get sort button text based on active sort
  const getSortLabel = () => {
    if (activeSort === 'newest') return 'Newest';
    if (activeSort === 'closingSoon') return 'Closing Soon';
    if (activeSort === 'distance') return 'Distance';
    return 'Sort';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
          >
            <SortAsc className="h-4 w-4 mr-1" />
            {getSortLabel()}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onSortChange('newest')}
        >
          Newest
          {activeSort === 'newest' && <span>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onSortChange('closingSoon')}
        >
          Closing Soon
          {activeSort === 'closingSoon' && <span>✓</span>}
        </DropdownMenuItem>
        {showDistanceSort && (
          <DropdownMenuItem
            className="justify-between"
            onClick={() => onSortChange('distance')}
          >
            Distance
            {activeSort === 'distance' && <span>✓</span>}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
