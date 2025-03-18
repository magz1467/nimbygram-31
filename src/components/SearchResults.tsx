import { Link } from 'react-router-dom';
import { useMapViewStore } from '../store/mapViewStore';

export function SearchResults() {
  const { setMapView } = useMapViewStore();
  
  return (
    <div>
      {/* Other content */}
      <button 
        onClick={() => setMapView(true)}
        className="text-pink-500"
      >
        View on Map
      </button>
    </div>
  );
} 