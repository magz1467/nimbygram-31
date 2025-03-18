import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="bg-blue-600 text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Track Planning Applications In Your Area
            </h1>
            <p className="text-xl mb-8">
              Stay informed about development projects in your neighborhood with NimbyGram.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition duration-200">
                Get Started
              </button>
              <button className="bg-transparent hover:bg-blue-700 border border-white font-medium py-3 px-6 rounded-md transition duration-200">
                Learn More
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="/images/hero-image.jpg" 
              alt="Planning application map" 
              className="rounded-lg shadow-lg w-full h-auto"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "https://via.placeholder.com/600x400?text=NimbyGram";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
