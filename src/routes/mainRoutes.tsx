
import Index from "@/pages/Index";
import About from "@/pages/About";
import Press from "@/pages/Press";
import Admin2 from "@/pages/Admin2";
import Profile from "@/pages/Profile";
import Help from "@/pages/Help";
import Feed from "@/pages/Feed";
import SearchResultsPage from "@/pages/SearchResults";
import MapViewPage from "@/pages/MapView";
import { RouteObject } from "react-router-dom";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export const mainRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/press",
    element: <Press />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin2",
    element: <Admin2 />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/profile",
    element: <Profile />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/help",
    element: <Help />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/feed",
    element: <Feed />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/search-results",
    element: <SearchResultsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/map",
    element: <MapViewPage />,
    errorElement: <RouteErrorBoundary />,
  },
];
