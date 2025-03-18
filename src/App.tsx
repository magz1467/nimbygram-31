import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMapViewStore } from './store/mapViewStore';
import { HomePage } from './pages/HomePage';
import { MapView } from './pages/MapView';
import { SearchResults } from './pages/SearchResults';
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function App() {
  const { isMapView } = useMapViewStore();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={isMapView ? <MapView /> : <HomePage />} />
        <Route path="/search-results" element={isMapView ? <MapView /> : <SearchResults />} />
        <Route path="/map" element={<MapRedirect />} />
      </Routes>
    </Router>
  );
}

// Helper component to handle redirects from /map URL
function MapRedirect() {
  const { setMapView } = useMapViewStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("MapRedirect: Setting map view to true and redirecting to /");
    setMapView(true);
    navigate('/', { replace: true });
  }, [setMapView, navigate]);
  
  return null;
}

export default App;
