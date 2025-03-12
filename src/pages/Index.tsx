
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
import { PageSeparator } from "@/components/ui/page-separator";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PageSeparator />
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 z-10 relative">
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
