import { useMapViewStore } from '../store/mapViewStore';
import { MapComponent } from './MapComponent';

export function MapView() {
  const { isMapView } = useMapViewStore();
  
  // Don't render anything if map view is not active
  if (!isMapView) return null;
  
  return (
    <div className="fixed inset-0 z-10 bg-white">
      <div className="h-full w-full">
        <MapComponent 
          applications={[]} // Pass your applications here
          selectedId={null} 
          searchLocation={null}
          onPinClick={() => {}}
        />
      </div>
    </div>
  );
} 