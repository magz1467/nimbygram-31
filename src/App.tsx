import React from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Header } from './components/Header';
import './App.css';
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
    <div className="app">
      <Header />
      <main>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
