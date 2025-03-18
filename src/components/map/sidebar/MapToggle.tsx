import { useNavigate } from 'react-router-dom';
import { useMapViewStore } from '../../../store/mapViewStore';

export function MapToggle() {
  const navigate = useNavigate();
  const { isMapView, setMapView } = useMapViewStore();
  
  const handleToggle = () => {
    console.log("Toggling map view from MapToggle component");
    setMapView(!isMapView);
  };
  
  return (
    <button onClick={handleToggle}>
      {isMapView ? 'List View' : 'Map View'}
    </button>
  );
} 