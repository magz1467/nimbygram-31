
import ApplicationsDashboardMapPage from "@/pages/applications/dashboard/map";
import SavedApplicationsPage from "@/pages/saved";
import { RouteObject } from "react-router-dom";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import MapViewPage from "@/pages/MapView";
import SearchResultsPage from "@/pages/SearchResults";

export const applicationRoutes: RouteObject[] = [
  {
    path: "/applications/dashboard/map",
    element: <ApplicationsDashboardMapPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/saved",
    element: <SavedApplicationsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/map",
    element: <MapViewPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/search-results",
    element: <SearchResultsPage />,
    errorElement: <RouteErrorBoundary />,
  },
];
