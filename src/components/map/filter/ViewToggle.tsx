import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

interface ViewToggleProps {
  isMapView: boolean;
  onToggleView: () => void;
}

export const ViewToggle = ({ isMapView, onToggleView }: ViewToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggleView}
      className="flex items-center gap-1.5"
    >
      {isMapView ? (
        <>
          <List className="h-4 w-4" />
          List View
        </>
      ) : (
        <>
          <Map className="h-4 w-4" />
          Map View
        </>
      )}
    </Button>
  );
};