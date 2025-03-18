import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMapViewStore } from '../store/mapViewStore';

export function MapView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setMapView } = useMapViewStore();
  
  useEffect(() => {
    // Set map view to true in the store
    setMapView(true);
    
    // Redirect to search-results page while preserving query parameters
    const queryString = searchParams.toString();
    navigate(`/search-results${queryString ? `?${queryString}` : ''}`, {
      replace: true, // Replace the current entry in the history stack
      state: location.state // Preserve any state that was passed
    });
  }, [navigate, searchParams, setMapView, location.state]);
  
  // This component will redirect, so we don't need to render anything substantial
  return <div>Redirecting to search results...</div>;
}
