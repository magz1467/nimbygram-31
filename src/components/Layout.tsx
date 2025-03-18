import { Link } from 'react-router-dom';
import { useMapViewStore } from '../store/mapViewStore';

export function Layout() {
  const { setMapView } = useMapViewStore();
  
  // Replace any links like this:
  // <Link to="/map">Map View</Link>
  
  // With this:
  return (
    <div>
      {/* Your layout content */}
      <button 
        onClick={() => {
          console.log("Setting map view to true from Layout");
          setMapView(true);
        }}
      >
        Map View
      </button>
    </div>
  );
} 