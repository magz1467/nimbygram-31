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
      <header>
        <h1>NimbyGram</h1>
      </header>
      <main>
        <p>Welcome to NimbyGram - Site under construction</p>
      </main>
    </div>
  );
};

export default App;
