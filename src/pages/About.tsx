import React from 'react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "@/components/ui/image";
import GetInTouch from "@/components/GetInTouch";

const About: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">About NimbyGram</h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              NimbyGram is a platform dedicated to making planning information accessible and transparent for everyone.
              Our mission is to empower communities by providing easy access to planning applications and development
              information in their local area.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              We believe that everyone should have easy access to information about developments that might affect their
              community. By making planning data more accessible, we aim to:
            </p>
            
            <ul>
              <li>Increase transparency in the planning process</li>
              <li>Help residents stay informed about local developments</li>
              <li>Provide tools for meaningful community engagement</li>
              <li>Support better decision-making through improved access to information</li>
            </ul>
            
            <h2>How It Works</h2>
            <p>
              NimbyGram aggregates planning application data from local authorities across the UK. Our platform allows you to:
            </p>
            
            <ul>
              <li>Search for planning applications by location</li>
              <li>View applications on an interactive map</li>
              <li>Set up alerts for new applications in your area</li>
              <li>Track the progress of applications through the planning process</li>
            </ul>
            
            <h2>Our Team</h2>
            <p>
              NimbyGram was founded by a team of urban planners, developers, and civic tech enthusiasts who are passionate
              about improving access to planning information. We're committed to building tools that make it easier for
              communities to engage with the planning process.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              We'd love to hear from you! If you have any questions, feedback, or suggestions, please don't hesitate to
              get in touch at <a href="mailto:info@nimbygram.com" className="text-blue-600 hover:text-blue-800">info@nimbygram.com</a>.
            </p>
          </div>
        </div>

        {/* Get In Touch section */}
        <GetInTouch />
      </div>
      <Footer />
    </>
  );
};

export default About;