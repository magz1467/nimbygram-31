
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortType } from "@/types/application-types";

interface SortDropdownProps {
  children: React.ReactNode;
  activeSort: SortType;
  onSortChange: (sortType: SortType) => void;
}

export const SortDropdown = ({ children, activeSort, onSortChange }: SortDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onSortChange('distance')}
        >
          Distance
          {activeSort === 'distance' && <span>✓</span>}
        </DropdownMenuItem>
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
        <DropdownMenuItem
          className="justify-between"
          onClick={() => onSortChange('impact')}
        >
          Impact
          {activeSort === 'impact' && <span>✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
