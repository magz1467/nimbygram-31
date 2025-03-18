import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string, location: string, radius: number) => void;
  initialQuery?: string;
  initialLocation?: string;
  initialRadius?: number;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialQuery = '',
  initialLocation = '',
  initialRadius = 5
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [radius, setRadius] = useState(initialRadius);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location, radius);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      setLocationError('');
      setUseCurrentLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address from coordinates
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setLocation(address);
              setIsGettingLocation(false);
            })
            .catch(error => {
              console.error('Error getting address:', error);
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setIsGettingLocation(false);
            });
        },
        (error) => {
          setIsGettingLocation(false);
          setUseCurrentLocation(false);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Location permission denied. Please enable location services.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out.');
              break;
            default:
              setLocationError('An unknown error occurred.');
          }
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Search Term
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. extension, restaurant, housing"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter postcode or address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isGettingLocation}
            />
            {isGettingLocation && (
              <div className="absolute right-3 top-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
            disabled={isGettingLocation}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Use current location
          </button>
          {locationError && (
            <p className="text-red-600 text-sm mt-1">{locationError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Radius (km)
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Search Applications
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
