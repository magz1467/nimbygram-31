
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { initReloadTracker } from "@/utils/reloadTracker";

// Create a router instance
const router = createBrowserRouter(routes);

function App() {
  // Initialize the reload tracker on app mount
  useEffect(() => {
    initReloadTracker();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
