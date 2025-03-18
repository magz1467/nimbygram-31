
import { Outlet } from "react-router-dom";
import { RouteChangeTracker } from "./RouteChangeTracker";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <>
      <RouteChangeTracker />
      <Header />
      <Outlet />
    </>
  );
}
