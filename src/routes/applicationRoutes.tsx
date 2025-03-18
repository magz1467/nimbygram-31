
import React from 'react';
import { RouteObject } from 'react-router-dom';
import SearchResultsPage from '../pages/SearchResultsPage';
import MapView from '../pages/MapView';

const applicationRoutes: RouteObject[] = [
  {
    path: "search-results",
    element: <SearchResultsPage />
  },
  {
    path: "map",
    element: <MapView />
  }
];

export default applicationRoutes;
