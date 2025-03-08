
import { useState, useEffect } from 'react';

export const useCoordinates = (postcode: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!postcode) {
        console.log('❌ useCoordinates: No postcode provided');
        return;
      }
      
      // Reset state on new request
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      
      console.log('🔍 useCoordinates: Fetching coordinates for:', postcode);
      
      try {
        // Check if this is likely a Google Place ID (starts with "ChIJ" and is longer than regular postcodes)
        const isGooglePlaceId = postcode.startsWith('ChIJ') || (postcode.length > 15 && !postcode.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i));
        
        if (isGooglePlaceId) {
          console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
          await fetchCoordinatesFromPlaceId(postcode);
        } else {
          // Regular UK postcode - use Postcodes.io
          console.log('📫 Regular postcode detected, using Postcodes.io API');
          await fetchCoordinatesFromPostcodesIo(postcode);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ useCoordinates: Error fetching coordinates:", errorMessage);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error(String(error)));
          // Important: Reset coordinates when there's an error
          setCoordinates(null);
        }
      } finally {
        if (isMounted) {
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
        }
      }
    };

    const fetchCoordinatesFromPlaceId = async (placeId: string) => {
      // Use the Google Maps API that's already loaded
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        // Load the Google Maps API if not already loaded
        await loadGoogleMapsScript();
      }

      return new Promise<void>((resolve, reject) => {
        try {
          const placesService = new google.maps.places.PlacesService(document.createElement('div'));
          
          placesService.getDetails(
            {
              placeId: placeId,
              fields: ['geometry']
            },
            (place, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK || !place || !place.geometry || !place.geometry.location) {
                reject(new Error(`Failed to get location for place ID: ${status}`));
                return;
              }
              
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              console.log('📍 Got coordinates from Google Places API:', [lat, lng]);
              
              if (isMounted) {
                setCoordinates([lat, lng]);
              }
              resolve();
            }
          );
        } catch (error) {
          console.error('Error in Places API call:', error);
          reject(error);
        }
      });
    };

    const fetchCoordinatesFromPostcodesIo = async (postcode: string) => {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`);
      
      if (!response.ok) {
        throw new Error(`Postcode API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📍 useCoordinates: API response:', data);
      
      if (isMounted && data.status === 200 && data.result) {
        // Check explicitly for latitude and longitude
        if (typeof data.result.latitude === 'number' && typeof data.result.longitude === 'number') {
          const newCoordinates: [number, number] = [data.result.latitude, data.result.longitude];
          console.log('✅ useCoordinates: Setting coordinates:', newCoordinates);
          setCoordinates(newCoordinates);
        } else {
          throw new Error("Invalid coordinates in postcode API response");
        }
      } else {
        throw new Error("Invalid response from postcode API");
      }
    };

    // Helper function to load Google Maps script
    const loadGoogleMapsScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // If script is already loaded, resolve immediately
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        
        const apiKey = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';
        
        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps script:', error);
          reject(new Error('Google Maps script failed to load'));
        };
        
        document.head.appendChild(script);
      });
    };

    if (postcode && postcode.trim()) {
      console.log('🔄 useCoordinates: Postcode changed, fetching new coordinates:', postcode);
      fetchCoordinates();
    } else {
      setCoordinates(null);
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
    };
  }, [postcode]);

  return { coordinates, isLoading, error };
};
