
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Mission from "@/components/Mission";
import StayUpToDate from "@/components/StayUpToDate";
import GetInTouch from "@/components/GetInTouch";
import Footer from "@/components/Footer";
import { QuoteSection } from "@/components/QuoteSection";
import { PageSeparator } from "@/components/ui/page-separator";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <PageSeparator />
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
