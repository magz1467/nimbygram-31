
import ResidentServices from "@/pages/ResidentServices";
import DeveloperServices from "@/pages/DeveloperServices";
import CouncilServices from "@/pages/CouncilServices";
import { RouteObject } from "react-router-dom";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { AppLayout } from "@/components/AppLayout";

export const serviceRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: "/resident-services",
        element: <ResidentServices />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/developer-services",
        element: <DeveloperServices />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/council-services",
        element: <CouncilServices />,
        errorElement: <RouteErrorBoundary />,
      },
    ]
  }
];
