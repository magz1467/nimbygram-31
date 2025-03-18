import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useMapViewStore } from './store/mapViewStore';
import App from './App';
import { HomePage } from './pages/HomePage';
import { SearchResults } from './pages/SearchResults';
import { useEffect } from 'react';

// Create a wrapper component to handle the map redirect
function MapRedirect() {
  const { setMapView } = useMapViewStore();
  
  useEffect(() => {
    console.log("MapRedirect: Setting map view to true and redirecting to /");
    setMapView(true);
    // No need to navigate, the state change will trigger the correct view
  }, [setMapView]);
  
  return <Navigate to="/" replace />;
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
      // Redirect /map to / with isMapView=true
      {
        path: 'map',
        element: <MapRedirect />
      }
    ]
  }
]); 