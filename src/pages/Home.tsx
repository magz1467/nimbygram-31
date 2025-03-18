import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchForm } from '@/components/SearchForm';
import { useMapViewStore } from '@/store/mapViewStore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const { isMapView, setMapView } = useMapViewStore();

  const handleSearch = (query: string, location: string, radius: number) => {
    setSearchQuery(query);
    setSearchLocation(location);
    setSearchRadius(radius);
    
    // Build query string
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    if (radius) params.append('radius', radius.toString());
    if (isMapView) params.append('view', 'map');
    
    // Navigate to search results
    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <Header />
      <div className="hero">
        <div className="container">
          <h1>Find planning applications near you</h1>
          <p>Search for planning applications, view details, and stay informed about developments in your area.</p>
          
          <div className="search-container">
            <SearchForm 
              onSearch={handleSearch}
              initialQuery={searchQuery}
              initialLocation={searchLocation}
              initialRadius={searchRadius}
            />
            
            <div className="view-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isMapView}
                  onChange={(e) => setMapView(e.target.checked)}
                />
                Show results on map
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features">
        <div className="container">
          <h2>How NimbyGram helps you</h2>
          
          <div className="feature-grid">
            <div className="feature">
              <h3>Find Applications</h3>
              <p>Search for planning applications by location, type, or keyword.</p>
            </div>
            
            <div className="feature">
              <h3>Stay Informed</h3>
              <p>Get notifications about new applications in your area.</p>
            </div>
            
            <div className="feature">
              <h3>Understand Planning</h3>
              <p>Learn about the planning process and how decisions are made.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
