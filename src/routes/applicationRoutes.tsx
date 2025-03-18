
import ApplicationsDashboardMapPage from "@/pages/applications/dashboard/map";
import SavedApplicationsPage from "@/pages/saved";
import { RouteObject } from "react-router-dom";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { MapView } from "@/components/MapView";

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
    element: <MapView />,
    errorElement: <RouteErrorBoundary />,
  },
];
