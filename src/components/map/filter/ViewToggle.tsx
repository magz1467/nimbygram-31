import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import { useMapViewStore } from "../../../store/mapViewStore";

interface ViewToggleProps {
  isMapView: boolean;
  onToggleView: () => void;
}

export const ViewToggle = ({ isMapView, onToggleView }: ViewToggleProps) => {
  const { setMapView } = useMapViewStore();
  
  const handleToggle = () => {
    console.log("ViewToggle: Setting map view to", !isMapView);
    setMapView(!isMapView);
    // Still call the original handler for backward compatibility
    onToggleView();
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5"
        onClick={handleToggle}
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
    </div>
  );
};