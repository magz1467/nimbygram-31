
import { Outlet } from "react-router-dom";
import { RouteChangeTracker } from "./RouteChangeTracker";

export function AppLayout() {
  return (
    <>
      <RouteChangeTracker />
      <Outlet />
    </>
  );
}
