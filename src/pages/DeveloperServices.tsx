import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HomeownerSection } from "@/components/services/HomeownerSection";
import DeveloperSection from "@/components/services/DeveloperSection";

const DeveloperServices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Our Services</h1>
          
          <DeveloperSection />
          <HomeownerSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperServices;
