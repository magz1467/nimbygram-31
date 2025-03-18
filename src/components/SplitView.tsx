
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
  
  // Get search location from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postcode = params.get('postcode');
    if (postcode) {
      // Mocked function for now
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

  // On desktop: show split view when isMapView is true
  // On mobile: toggle between views
  return (
    <div className="h-full">
      {isDesktop ? (
        isMapView ? (
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
          <ApplicationList 
            applications={applications} 
            selectedId={selectedApplicationId}
            onCardClick={handleCardClick}
          />
        )
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

// Mocked helper function to convert postcode to coordinates
async function fetchPostcodeCoordinates(postcode) {
  console.log("Fetching coordinates for postcode:", postcode);
  // Return mock data for now
  return {
    lat: 51.5074,
    lng: -0.1278
  };
}
