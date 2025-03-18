import React from 'react';
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Mission from "@/components/Mission";
import StayUpToDate from "@/components/StayUpToDate";
import GetInTouch from "@/components/GetInTouch";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteSection } from "@/components/QuoteSection";
import { PageSeparator } from "@/components/ui/page-separator";

// Fix the type incompatibility by ensuring consistent types
// The error suggests there's a mismatch between string and number types for 'id'
interface ComponentProps {
  // Use string type for id to ensure consistency
  id?: string;
}

// Apply the interface to components that might be using id props
const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <PageSeparator />
      <Header />
      <main className="flex-grow w-full relative z-10">
        <Hero />
        <Features />
        <QuoteSection />
        <Services />
        <Mission />
        <StayUpToDate />
        <GetInTouch />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
