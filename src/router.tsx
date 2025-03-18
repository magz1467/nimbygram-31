import { createBrowserRouter } from 'react-router-dom';
import { useMapViewStore } from './store/mapViewStore';
import App from './App';
import Index from './pages/Index';
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

// Simple fallback component for debugging
const FallbackComponent = () => {
  console.log('🎨 Fallback component rendering');
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
      <h2 className="text-xl font-bold">Loading...</h2>
      <p>If you see this message for more than a few seconds, there might be an issue with the application.</p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div className="p-4 bg-red-100">Error loading route</div>,
    children: [
      {
        index: true,
        element: <Index />,
        errorElement: <div className="p-4 bg-red-100">Error loading Index</div>,
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
], {
  // Add a fallback component while routes are loading
  future: {
    v7_startTransition: true,
  },
  basename: '/',
});
