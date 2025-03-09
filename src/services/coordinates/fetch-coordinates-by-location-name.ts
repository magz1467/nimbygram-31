
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
    
    // Try to find the location with UK country restriction to improve accuracy
    const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { 
          address: locationName,
          region: 'gb', // Force UK region for better results
          componentRestrictions: {
            country: 'gb' // Restrict to United Kingdom
          }
        }, 
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            console.log('✅ Geocoder found results:', results.length);
            resolve(results);
          } else {
            console.error('❌ Geocoder failed:', status);
            reject(new Error(`Geocoder failed: ${status}`));
          }
        }
      );
    });
    
    if (response && response.length > 0) {
      const location = response[0].geometry.location;
      // IMPORTANT: Get coordinates in correct order - lat first, then lng
      const lat = location.lat();
      const lng = location.lng();
      
      console.log('📍 Got coordinates from Geocoding API:', [lat, lng], 'for location:', locationName);
      console.log('📍 Geometry location type:', response[0].geometry.location_type);
      console.log('📍 First result formatted address:', response[0].formatted_address);
      
      // Return coordinates in correct [lat, lng] order for consistency with other services
      return [lat, lng];
    }
    
    throw new Error("No results found for location");
  } catch (error) {
    console.error('❌ Error in geocoding location name:', error);
    throw new Error(`Could not find coordinates for location: ${error.message}`);
  }
};
