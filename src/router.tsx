import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import ErrorPage from './pages/ErrorPage';
import { useMapViewStore } from './store/mapViewStore';
import { useEffect } from 'react';

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

// Router component that defines all routes
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="search-results" element={<SearchResults />} />
        <Route path="map" element={<MapRedirect />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
