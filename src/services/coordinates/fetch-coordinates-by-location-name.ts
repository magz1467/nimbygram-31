
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
    
    // Explicitly append UK to the location name if not already there
    const searchLocation = locationName.toLowerCase().includes('uk') ? 
      locationName : 
      `${locationName}, UK`;
    
    console.log('🔍 Enhanced search location:', searchLocation);
    
    // Try to find the location with UK country restriction to improve accuracy
    const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { 
          address: searchLocation, 
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
            
            // More descriptive error message based on status
            const errorMessages: Record<string, string> = {
              [google.maps.GeocoderStatus.ZERO_RESULTS]: "We couldn't find this location in the UK",
              [google.maps.GeocoderStatus.OVER_QUERY_LIMIT]: "Too many location searches, please try again later",
              [google.maps.GeocoderStatus.REQUEST_DENIED]: "Location search API access denied. Please try using a postcode instead.",
              [google.maps.GeocoderStatus.INVALID_REQUEST]: "Invalid location search request",
              [google.maps.GeocoderStatus.UNKNOWN_ERROR]: "Unknown error while searching for location",
            };
            
            const message = errorMessages[status] || `Geocoder failed: ${status}`;
            reject(new Error(message));
          }
        }
      );
    });
    
    if (response && response.length > 0) {
      const location = response[0].geometry.location;
      // Get coordinates in correct order - lat first, then lng
      const lat = location.lat();
      const lng = location.lng();
      
      console.log('📍 Got coordinates from Geocoding API:', [lat, lng], 'for location:', locationName);
      console.log('📍 Geometry location type:', response[0].geometry.location_type);
      console.log('📍 First result formatted address:', response[0].formatted_address);
      
      // Return coordinates in correct [lat, lng] order for consistency with other services
      return [lat, lng];
    }
    
    throw new Error("No results found for location");
  } catch (error: any) {
    console.error('❌ Error in geocoding location name:', error);
    
    // Special handling for API key issues
    if (error.message.includes('API key') || 
        error.message.includes('denied') || 
        error.message.includes('not authorized')) {
      // Fallback to try the postcode lookup if this looks like a UK postcode
      const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      if (postcodePattern.test(locationName.trim())) {
        console.log('⚠️ API key issue detected, but location looks like a postcode. Trying postcode lookup...');
        throw new Error(`Google Maps API error. Try using the specific postcode instead of a location name.`);
      }
      
      throw new Error(`Unable to use location search. Please try using a UK postcode instead.`);
    }
    
    throw new Error(`Could not find coordinates for location: ${error.message}`);
  }
};
