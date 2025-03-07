
import { Button } from "@/components/ui/button";
import { List, SortAsc } from "lucide-react";
import { SortDropdown } from "../filter/SortDropdown";
import { SortType } from "@/types/application-types";
import { Application } from "@/types/planning";

interface MobileMapControlsProps {
  selectedId: number | null;
  applications: Application[];
  onSelectApplication: (id: number | null) => void;
  onToggleView?: () => void;
  onSortChange?: (sortType: SortType) => void;
  activeSort?: SortType;
}

export const MobileMapControls = ({
  selectedId,
  applications,
  onSelectApplication,
  onToggleView,
  onSortChange,
  activeSort,
}: MobileMapControlsProps) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 px-4 z-10">
      {onToggleView && (
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1.5 w-full bg-white text-black hover:bg-gray-100 shadow-lg"
          onClick={onToggleView}
        >
          <List className="h-4 w-4" />
          List View
        </Button>
      )}

      {onSortChange && activeSort !== undefined && (
        <SortDropdown
          activeSort={activeSort}
          onSortChange={onSortChange}
        >
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 bg-white text-black hover:bg-gray-100 shadow-lg"
          >
            <SortAsc className="h-4 w-4" />
          </Button>
        </SortDropdown>
      )}
    </div>
  );
};
