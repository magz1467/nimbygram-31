
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useMapViewStore } from './store/mapViewStore';
import App from './App';
import { HomePage } from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Create a wrapper component to handle the map redirect
function MapRedirect() {
  const { setMapView } = useMapViewStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("MapRedirect: Setting map view to true and redirecting to search-results");
    setMapView(true);
    
    // We'll keep the URL params for the redirect
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.toString() 
      ? `/search-results?${searchParams.toString()}`
      : '/search-results';
      
    navigate(redirectPath, { replace: true });
  }, [setMapView, location.search, navigate]);
  
  return <div>Redirecting...</div>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'search-results',
        element: <SearchResults />
      },
      // Redirect /map to /search-results with isMapView=true
      {
        path: 'map',
        element: <MapRedirect />
      }
    ]
  }
]);
