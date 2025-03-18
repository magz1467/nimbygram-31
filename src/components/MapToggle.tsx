
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

interface MapToggleProps {
  isMapView?: boolean;
  onToggle?: () => void;
}

export function MapToggle({ isMapView, onToggle }: MapToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
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
}
