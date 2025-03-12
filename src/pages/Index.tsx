
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Mission from "@/components/Mission";
import StayUpToDate from "@/components/StayUpToDate";
import GetInTouch from "@/components/GetInTouch";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteSection } from "@/components/QuoteSection";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <ErrorBoundary fallback={<div className="p-4">Error loading hero section</div>}>
            <Suspense fallback={<div className="p-4">Loading hero section...</div>}>
              <Hero />
            </Suspense>
          </ErrorBoundary>
          
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <ErrorBoundary fallback={<div className="p-4">Error loading features section</div>}>
              <Suspense fallback={<div className="p-4">Loading features...</div>}>
                <Features />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="p-4">Error loading quote section</div>}>
              <QuoteSection />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="p-4">Error loading services section</div>}>
              <Services />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="p-4">Error loading mission section</div>}>
              <Mission />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="p-4">Error loading updates section</div>}>
              <StayUpToDate />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="p-4">Error loading contact section</div>}>
              <GetInTouch />
            </ErrorBoundary>
          </div>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default Index;
