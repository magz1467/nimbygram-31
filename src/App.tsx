import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import MapView from "./pages/MapView";
import ResidentServices from "./pages/ResidentServices";
import DeveloperServices from "./pages/DeveloperServices";
import CouncilServices from "./pages/CouncilServices";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Careers from "./pages/Careers";
import Help from "./pages/Help";
import Press from "./pages/Press";
import Accessibility from "./pages/Accessibility";
import Feedback from "./pages/Feedback";
import Investors from "./pages/Investors";

// Import new content pages
import PlanningBasics from "./pages/content/PlanningBasics";
import LocalPlans from "./pages/content/LocalPlans";
import SustainableDevelopment from "./pages/content/SustainableDevelopment";
import PlanningAppeals from "./pages/content/PlanningAppeals";
import HeritageConservation from "./pages/content/HeritageConservation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/services/residents" element={<ResidentServices />} />
          <Route path="/services/developers" element={<DeveloperServices />} />
          <Route path="/services/councils" element={<CouncilServices />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/help" element={<Help />} />
          <Route path="/press" element={<Press />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/investors" element={<Investors />} />
          
          {/* New content routes */}
          <Route path="/content/planning-basics" element={<PlanningBasics />} />
          <Route path="/content/local-plans" element={<LocalPlans />} />
          <Route path="/content/sustainable-development" element={<SustainableDevelopment />} />
          <Route path="/content/planning-appeals" element={<PlanningAppeals />} />
          <Route path="/content/heritage-conservation" element={<HeritageConservation />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;