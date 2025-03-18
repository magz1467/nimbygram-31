
import { Button } from "./ui/button";
import { Map, List } from "lucide-react";
import { useMapViewStore } from "../store/mapViewStore";
import { useLocation } from "react-router-dom";

export function MapToggle() {
  const location = useLocation();
  const { isMapView, setMapView } = useMapViewStore();
  
  const handleToggle = () => {
    console.log("Toggling map view in MapToggle, current state:", isMapView);
    // Simply toggle the state in the store, no navigation
    setMapView(!isMapView);
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-gray-800"
    >
      {isMapView ? (
        <>
          <List className="h-4 w-4" />
          List
        </>
      ) : (
        <>
          <Map className="h-4 w-4" />
          Map
        </>
      )}
    </Button>
  );
} 
