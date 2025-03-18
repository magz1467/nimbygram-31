import { Button } from "./ui/button";
import { Map, List } from "lucide-react";
import { useMapViewStore } from "../store/mapViewStore";

interface MapToggleButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const MapToggleButton = ({ 
  className = "", 
  variant = "outline",
  size = "sm"
}: MapToggleButtonProps) => {
  const { isMapView, setMapView } = useMapViewStore();

  const handleToggle = () => {
    console.log(`MapToggleButton: Setting map view to ${!isMapView}`);
    setMapView(!isMapView);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-1.5 ${className}`}
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
  );
}; 