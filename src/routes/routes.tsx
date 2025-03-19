
import { RouteObject } from "react-router-dom";
import { mainRoutes } from "./mainRoutes";
import { applicationRoutes } from "./applicationRoutes";
import { contentRoutes } from "./contentRoutes";
import { serviceRoutes } from "./serviceRoutes";
import { legalRoutes } from "./legalRoutes";
import { authRoutes } from "./authRoutes";
import { AppLayout } from "@/components/AppLayout";
import Index from "@/pages/Index";

export const routes: RouteObject[] = [
  // Special case for index route
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
    ],
  },
  // All other routes
  {
    element: <AppLayout />,
    children: [
      ...mainRoutes.filter(route => route.path !== "/"), // Filter out the index route
      ...applicationRoutes,
      ...contentRoutes,
      ...serviceRoutes,
      ...legalRoutes,
      ...authRoutes,
    ],
  }
];
