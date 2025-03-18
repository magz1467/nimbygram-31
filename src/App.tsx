import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import './App.css';
import { createBrowserRouter, RouterProvider, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { initReloadTracker } from "@/utils/reloadTracker";
import { AppLayout } from "@/components/AppLayout";
import Home from "./pages/Home";
import SearchResultsPage from "./pages/SearchResultsPage";
import MapView from "./pages/MapView";

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
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="search-results" element={<SearchResultsPage />} />
              <Route path="map" element={<MapView />} />
              {/* other routes */}
            </Route>
          </Routes>
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
