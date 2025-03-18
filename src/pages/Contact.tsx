import { useState } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { ContactSection } from "@/components/ContactSection";

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Chat with Us</h2>
            <Chatbot />
          </div>
          
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <ContactSection 
              title="Sales Inquiries"
              description="Interested in our services? Our sales team is here to help."
              email="marco@nimbygram.com"
            />
            <ContactSection 
              title="Partnership Opportunities"
              description="Looking to partner with us? Let's explore possibilities together."
              email="marco@nimbygram.com"
            />
            <ContactSection 
              title="Questions & Complaints"
              description="Have a question or concern? We're here to listen and help."
              email="marco@nimbygram.com"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;