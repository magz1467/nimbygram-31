import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import SearchForm from '../components/SearchForm';
import ApplicationMap from '../components/ApplicationMap';
import PlanningApplicationList from '../components/PlanningApplicationList';
import { useApplications } from '../context/ApplicationContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { applications, loading, error } = useApplications();
  
  const handleSearch = (query: string, location: string, radius: number) => {
    navigate(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&radius=${radius}`);
  };
  
  const handleMarkerClick = (application: any) => {
    navigate(`/application/${application.id}`);
  };

  const handleApplicationClick = (application: any) => {
    navigate(`/application/${application.id}`);
  };

  // Get featured applications for the map (limit to 3)
  const mapApplications = applications?.slice(0, 3) || [];
  
  // Get recent applications for the list (limit to 6)
  const recentApplications = applications?.slice(0, 6) || [];

  // Handle error state
  if (error) {
    console.error("Error loading applications:", error);
  }

  return (
    <div>
      <Hero />
      
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Find Planning Applications</h2>
        <SearchForm onSearch={handleSearch} />
      </div>
      
      <Features />
      
      <div className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-6">Explore Applications Near You</h2>
          <p className="text-lg text-gray-600 mb-8">
            View recent planning applications in your area. Click on a marker to see more details.
          </p>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" text="Loading applications..." />
            </div>
          ) : (
            <ApplicationMap 
              applications={mapApplications}
              onMarkerClick={handleMarkerClick}
              height="400px"
            />
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/search')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              View All Applications
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Recent Applications</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading applications..." />
          </div>
        ) : (
          <PlanningApplicationList 
            applications={recentApplications} 
            onApplicationClick={handleApplicationClick}
          />
        )}
        
        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            View More Applications
          </button>
        </div>
      </div>
      
      <div className="container mx-auto max-w-6xl px-4 py-12 bg-gray-50 rounded-lg my-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">About NimbyGram</h2>
            <p className="text-lg mb-4">
              NimbyGram is a platform for exploring and understanding planning applications in your area.
              Our mission is to make planning information accessible and transparent for everyone.
            </p>
            <p className="text-lg mb-6">
              Whether you're a homeowner, a planning professional, or just curious about developments in your neighborhood,
              NimbyGram provides the tools you need to stay informed.
            </p>
            <button 
              onClick={() => navigate('/about')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              Learn More About Us
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img 
              src="/images/about-preview.jpg" 
              alt="Planning information" 
              className="rounded-lg w-full h-auto"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "https://via.placeholder.com/600x400?text=About+NimbyGram";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
