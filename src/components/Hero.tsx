import React from 'react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Planning Applications Near You
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Stay informed about development in your neighborhood with real-time updates on planning applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/search" 
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200"
              >
                Search Applications
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium transition duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white p-4 rounded-lg shadow-lg transform rotate-2">
              <img 
                src="/images/map-preview.jpg" 
                alt="Planning application map" 
                className="rounded"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Planning+Map";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
