import { useMapViewStore } from '../store/mapViewStore';

export function Navigation() {
  const { setMapView } = useMapViewStore();
  
  const handleMapNavigation = () => {
    setMapView(true);
  };
  
  return (
    <nav>
      {/* Your navigation content */}
      {/* Update any map links/buttons */}
    </nav>
  );
} 