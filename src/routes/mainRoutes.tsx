
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import Index from "@/pages/Index";

// Using normal import for Index to avoid flashing during initial load
export const mainRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
    errorElement: <RouteErrorBoundary />,
  },
];
