
/**
 * Utility functions for fetching coordinates using location names
 */
import { ensureGoogleMapsLoaded } from "./google-maps-loader";

/**
 * Fetches coordinates for a location name using the Google Geocoding API
 * @param locationName The name of the location to look up
 * @returns Promise with coordinates [lat, lng]
 */
export const fetchCoordinatesByLocationName = async (locationName: string): Promise<[number, number]> => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  
  if (!locationName) {
    throw new Error("No location name provided");
  }
  
  try {
    // First ensure Google Maps API is loaded
    await ensureGoogleMapsLoaded();
    
    // Use Geocoding API instead of Places API for location names
    const geocoder = new google.maps.Geocoder();
    
    // Try to find the location with country restriction to improve accuracy
    const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
      geocoder.geocode(
        { 
          address: locationName,
          region: 'uk', // Bias results to UK
          componentRestrictions: { country: 'gb' } // Restrict to Great Britain
        }, 
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log('✅ Geocoder found results:', results.length);
            resolve(results);
          } else {
            // If restricted search fails, try again without restrictions
            geocoder.geocode({ address: locationName }, (fallbackResults, fallbackStatus) => {
              if (fallbackStatus === google.maps.GeocoderStatus.OK && fallbackResults && fallbackResults.length > 0) {
                console.log('✅ Fallback geocoder found results:', fallbackResults.length);
                resolve(fallbackResults);
              } else {
                console.error('❌ Geocoder failed:', fallbackStatus);
                reject(new Error(`Geocoder failed: ${fallbackStatus}`));
              }
            });
          }
        }
      );
    });
    
    if (response && response.length > 0) {
      const location = response[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      
      console.log('📍 Got coordinates from Geocoding API:', [lat, lng]);
      return [lat, lng];
    }
    
    throw new Error("No results found for location");
  } catch (error) {
    console.error('❌ Error in geocoding location name:', error);
    throw new Error(`Could not find coordinates for location: ${error.message}`);
  }
};
