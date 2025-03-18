
import { Outlet } from "react-router-dom";
import { RouteChangeTracker } from "./RouteChangeTracker";
import { Header } from "./Header";
import Footer from "./Footer";

export function AppLayout() {
  return (
    <>
      <RouteChangeTracker />
      <Header />
      <Outlet />
    </>
  );
}
