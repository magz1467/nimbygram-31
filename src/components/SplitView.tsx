import { useState, useEffect } from 'react';
import { useMapViewStore } from '../store/mapViewStore';
import { ApplicationList } from './ApplicationList';
import { MapComponent } from './MapComponent';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function SplitView({ applications }) {
  const { isMapView, setMapView } = useMapViewStore();
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Get search location from URL or state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postcode = params.get('postcode');
    if (postcode) {
      // You'll need a function to convert postcode to coordinates
      fetchPostcodeCoordinates(postcode).then(coords => {
        setSearchLocation(coords);
      });
    }
  }, []);

  // Handle application selection from map
  const handlePinClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    // Scroll to the selected application in the list
    const element = document.getElementById(`application-${applicationId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle application selection from list
  const handleCardClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
  };

  // Toggle between map and list view (for mobile)
  const handleViewToggle = () => {
    setMapView(!isMapView);
  };

  // On desktop: show split view, On mobile: toggle between views
  return (
    <div className="h-full">
      {isDesktop ? (
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-1/2 overflow-y-auto">
            <ApplicationList 
              applications={applications} 
              selectedId={selectedApplicationId}
              onCardClick={handleCardClick}
            />
          </div>
          <div className="w-1/2">
            <MapComponent 
              applications={applications}
              selectedId={selectedApplicationId}
              searchLocation={searchLocation}
              onPinClick={handlePinClick}
            />
          </div>
        </div>
      ) : (
        <div className="h-full">
          <button 
            onClick={handleViewToggle}
            className="fixed bottom-4 right-4 z-10 bg-pink-500 text-white p-3 rounded-full shadow-lg"
          >
            {isMapView ? 'Show List' : 'Show Map'}
          </button>
          
          {isMapView ? (
            <MapComponent 
              applications={applications}
              selectedId={selectedApplicationId}
              searchLocation={searchLocation}
              onPinClick={handlePinClick}
            />
          ) : (
            <ApplicationList 
              applications={applications} 
              selectedId={selectedApplicationId}
              onCardClick={handleCardClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to convert postcode to coordinates
async function fetchPostcodeCoordinates(postcode) {
  // Implement your postcode lookup logic here
  // This could use a service like postcodes.io
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();
    if (data.status === 200) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching postcode coordinates:', error);
    return null;
  }
} 