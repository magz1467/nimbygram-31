
/**
 * Utility functions for fetching coordinates using location names
 */
import { ensureGoogleMapsLoaded } from "./google-maps-loader";

/**
 * Fetches coordinates for a location name using multiple approaches
 * @param placeName Name of the location to look up
 * @returns Promise with coordinates [lat, lng]
 */
export const fetchCoordinatesByLocationName = async (placeName: string): Promise<[number, number]> => {
  // Try multiple approaches to find coordinates for the location name
  console.log('⚡ Attempting to find coordinates for location:', placeName);
  
  // Approach 1: Try using the Places API directly
  try {
    console.log('🌍 Searching for place by name using Places API:', placeName);
    const placesResponse = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(placeName)}&limit=1`);
    
    if (!placesResponse.ok) {
      throw new Error(`Places API returned ${placesResponse.status}: ${placesResponse.statusText}`);
    }
    
    const placesData = await placesResponse.json();
    console.log('📍 Places API response:', placesData);
    
    if (placesData.status === 200 && placesData.result && placesData.result.length > 0) {
      const place = placesData.result[0];
      
      // Check if we have latitude and longitude
      if (place.latitude && place.longitude) {
        const newCoordinates: [number, number] = [parseFloat(place.latitude), parseFloat(place.longitude)];
        console.log('✅ Setting coordinates from Places API:', newCoordinates);
        return newCoordinates;
      }
    }
  } catch (error) {
    console.error('Failed with Places API, trying alternative method:', error);
  }
  
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
      return [lat, lng];
    }
  } catch (geocodeError) {
    console.error('Geocoding failed:', geocodeError);
  }
  
  // Approach 3: Last resort - try searching for a nearby postcode
  try {
    console.log('🔍 Trying to find a postcode near:', placeName);
    const response = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(placeName)}&limit=1`);
    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result.length > 0) {
        const postcode = data.result[0];
        const newCoordinates: [number, number] = [postcode.latitude, postcode.longitude];
        console.log('✅ Found nearby postcode coordinates:', newCoordinates);
        return newCoordinates;
      }
    }
  } catch (postcodeError) {
    console.error('Postcode search failed:', postcodeError);
  }
  
  // If we've tried everything and still don't have coordinates
  throw new Error(`Could not find coordinates for location: ${placeName}`);
};
