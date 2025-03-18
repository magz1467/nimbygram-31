import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ApplicationDetails from './pages/ApplicationDetails';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Careers from './pages/Careers';
import Investors from './pages/Investors';
import ResidentServices from './pages/ResidentServices';
import CouncilServices from './pages/CouncilServices';
import DeveloperServices from './pages/DeveloperServices';

// Content pages
import PlanningBasics from './pages/content/PlanningBasics';
import LocalPlans from './pages/content/LocalPlans';
import PlanningAppeals from './pages/content/PlanningAppeals';
import PlanningAuthorities from './pages/content/PlanningAuthorities';
import HeritageConservation from './pages/content/HeritageConservation';
import SustainableDevelopment from './pages/content/SustainableDevelopment';

// Note: This file is deprecated and kept for reference only
// Routing is now handled in routes/routes.tsx

// Router component that defines all routes - no longer in use
export const AppRoutes: React.FC = () => {
  // This is kept for reference but not used in the app
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="search-results" element={<SearchResults />} />
        <Route path="application/:id" element={<ApplicationDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="help" element={<Help />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="careers" element={<Careers />} />
        <Route path="investors" element={<Investors />} />
        
        {/* Service pages */}
        <Route path="resident-services" element={<ResidentServices />} />
        <Route path="council-services" element={<CouncilServices />} />
        <Route path="developer-services" element={<DeveloperServices />} />
        
        {/* Content pages */}
        <Route path="planning-basics" element={<PlanningBasics />} />
        <Route path="local-plans" element={<LocalPlans />} />
        <Route path="planning-appeals" element={<PlanningAppeals />} />
        <Route path="planning-authorities" element={<PlanningAuthorities />} />
        <Route path="heritage-conservation" element={<HeritageConservation />} />
        <Route path="sustainable-development" element={<SustainableDevelopment />} />
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}; 
