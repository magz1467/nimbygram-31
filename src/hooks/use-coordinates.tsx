
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
        // First determine what type of location string we have
        const isGooglePlaceId = postcode.startsWith('ChIJ') || 
                               postcode.startsWith('Eh') || 
                               (postcode.length > 15 && !postcode.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i));
        
        // Location names typically contain commas and "UK" at the end (e.g., "Wendover, Buckinghamshire, UK")
        const isLocationName = postcode.includes(',') && postcode.includes('UK');
        
        // Choose the right method based on what we're dealing with
        if (isGooglePlaceId) {
          console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
          await fetchCoordinatesFromPlaceId(postcode);
        } else if (isLocationName) {
          console.log('🏙️ Detected location name, extracting place name');
          // Extract the main location name (before the first comma)
          const placeName = postcode.split(',')[0].trim();
          if (placeName) {
            console.log('🔍 Searching for location by name:', placeName);
            await fetchCoordinatesByLocationName(placeName);
          } else {
            throw new Error("Invalid location name format");
          }
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

    // Function to fetch coordinates for a location name using the places API
    const fetchCoordinatesByLocationName = async (placeName: string) => {
      // Try multiple approaches to find coordinates for the location name
      console.log('⚡ Attempting to find coordinates for location:', placeName);
      
      let foundCoordinates = false;
      
      // Approach 1: Try using the Places API directly
      try {
        console.log('🌍 Searching for place by name using Places API:', placeName);
        const placesResponse = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(placeName)}&limit=1`);
        
        if (!placesResponse.ok) {
          throw new Error(`Places API returned ${placesResponse.status}: ${placesResponse.statusText}`);
        }
        
        const placesData = await placesResponse.json();
        console.log('📍 useCoordinates: Places API response:', placesData);
        
        if (placesData.status === 200 && placesData.result && placesData.result.length > 0) {
          const place = placesData.result[0];
          
          // Check if we have latitude and longitude
          if (place.latitude && place.longitude) {
            const newCoordinates: [number, number] = [parseFloat(place.latitude), parseFloat(place.longitude)];
            console.log('✅ useCoordinates: Setting coordinates from Places API:', newCoordinates);
            setCoordinates(newCoordinates);
            foundCoordinates = true;
            return;
          }
        }
      } catch (error) {
        console.error('Failed with Places API, trying alternative method:', error);
      }
      
      if (foundCoordinates) return;
      
      // Approach 2: Try using Google Maps geocoding as a fallback
      try {
        await ensureGoogleMapsLoaded();
        
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: `${placeName}, UK` }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        if (result.length > 0) {
          const location = result[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          console.log('📍 Got coordinates from Google Geocoder:', [lat, lng]);
          setCoordinates([lat, lng]);
          foundCoordinates = true;
          return;
        }
      } catch (geocodeError) {
        console.error('Geocoding failed:', geocodeError);
      }
      
      if (foundCoordinates) return;
      
      // Approach 3: Last resort - try searching for a nearby postcode
      try {
        console.log('🔍 Trying to find a postcode near:', placeName);
        const response = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(placeName)}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.length > 0) {
            const postcode = data.result[0];
            const newCoordinates: [number, number] = [postcode.latitude, postcode.longitude];
            console.log('✅ useCoordinates: Found nearby postcode coordinates:', newCoordinates);
            setCoordinates(newCoordinates);
            foundCoordinates = true;
            return;
          }
        }
      } catch (postcodeError) {
        console.error('Postcode search failed:', postcodeError);
      }
      
      // If we've tried everything and still don't have coordinates
      if (!foundCoordinates) {
        throw new Error(`Could not find coordinates for location: ${placeName}`);
      }
    };

    const fetchCoordinatesFromPlaceId = async (placeId: string) => {
      await ensureGoogleMapsLoaded();

      return new Promise<void>((resolve, reject) => {
        try {
          console.log('🔍 Getting place details for:', placeId);
          const placesService = new google.maps.places.PlacesService(document.createElement('div'));
          
          placesService.getDetails(
            {
              placeId: placeId,
              fields: ['geometry']
            },
            (place, status) => {
              console.log('📍 Place API status:', status);
              
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

    // Helper function to ensure Google Maps script is loaded
    const ensureGoogleMapsLoaded = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // If script is already loaded, resolve immediately
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        
        const apiKey = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';
        
        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
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
