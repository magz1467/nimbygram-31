import { createHashRouter, RouterProvider, ScrollRestoration } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";

const router = createHashRouter(routes);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ScrollRestoration />
      <Toaster />
    </>
  );
}

export default App;