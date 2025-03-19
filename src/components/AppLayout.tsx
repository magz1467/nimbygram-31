
import { Outlet } from "react-router-dom";
import { RouteChangeTracker } from "./RouteChangeTracker";
import { Header } from "./Header";
import Footer from "./Footer";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <RouteChangeTracker />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
