
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";

const router = createBrowserRouter(routes);

function App() {
  return (
    <MobileDetector>
      <RouterProvider router={router} />
      <Toaster />
    </MobileDetector>
  );
}

export default App;
