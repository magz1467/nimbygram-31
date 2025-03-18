import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { initReloadTracker } from "@/utils/reloadTracker";

const App: React.FC = () => {
  // Initialize the reload tracker on app mount
  useEffect(() => {
    initReloadTracker();
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
