import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApplicationProvider } from './context/ApplicationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import About from './pages/About';
import Contact from './pages/Contact';
import ApplicationDetails from './pages/ApplicationDetails';
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
    <ApplicationProvider>
      <Router>
        <div className="app min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/application/:id" element={<ApplicationDetails />} />
              <Route path="*" element={
                <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
                  <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                  <p className="text-xl text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ApplicationProvider>
  );
};

export default App;
