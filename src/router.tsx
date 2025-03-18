
import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import ErrorPage from './pages/ErrorPage';
import { useMapViewStore } from './store/mapViewStore';
import { useEffect } from 'react';
import Index from './pages/Index';

// MapRedirect component that sets map view to true and redirects
function MapRedirect() {
  const location = useLocation();
  const { setMapView } = useMapViewStore();
  
  useEffect(() => {
    // Set map view to true
    setMapView(true);
  }, [setMapView]);
  
  // Redirect to search results with the current query parameters
  return <Navigate to={`/search-results${location.search}`} replace />;
}

// Create and export the router
export const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "search-results",
        element: <SearchResults />,
      },
      {
        path: "map",
        element: <MapRedirect />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      }
    ],
  },
]);
