
/**
 * Utility functions for fetching coordinates using location names
 */
import { ensureGoogleMapsLoaded } from "./google-maps-loader";
import { withTimeout } from "@/utils/fetchUtils";

/**
 * Fetches coordinates for a location name using the Google Geocoding API
 * Also attempts to extract a postcode when possible for UK locations
 * @param locationName The name of the location to look up
 * @returns Promise with coordinates [lat, lng] and postcode if found
 */
export const fetchCoordinatesByLocationName = async (
  locationName: string
): Promise<{ coordinates: [number, number]; postcode?: string }> => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  
  if (!locationName) {
    throw new Error("No location name provided");
  }
  
  // Set longer timeout for large cities
  const isLargeCity = /\b(london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|newcastle|bristol|cardiff|belfast)\b/i.test(locationName);
  const timeoutMs = isLargeCity ? 30000 : 15000; // 30 seconds for large cities, 15 for others
  
  console.log(`🔍 Using ${timeoutMs}ms timeout for ${isLargeCity ? 'large city' : 'location'}: ${locationName}`);
  
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
    console.log('🔍 Current hostname:', window.location.hostname);
    
    // Wrap the geocoding promise with our timeout
    const geocodingPromise = new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      console.log('🔍 Starting geocoder.geocode call...');
      
      geocoder.geocode(
        { 
          address: searchLocation, 
          region: 'gb', // Force UK region for better results
          componentRestrictions: {
            country: 'gb' // Restrict to United Kingdom
          }
        }, 
        (results, status) => {
          console.log('🔍 Geocoder returned status:', status);
          console.log('🔍 Geocoder found results:', results ? results.length : 0);
          
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
    
    // Apply timeout to the geocoding promise
    const response = await withTimeout(
      geocodingPromise,
      timeoutMs,
      `Timeout while searching for simplified location "${locationName}". Large cities may take longer to process, try a more specific location.`
    );
    
    if (response && response.length > 0) {
      const result = response[0];
      const location = result.geometry.location;
      
      // Get coordinates in correct order - lat first, then lng
      const lat = location.lat();
      const lng = location.lng();
      
      console.log('📍 Got coordinates from Geocoding API:', [lat, lng], 'for location:', locationName);
      console.log('📍 Geometry location type:', result.geometry.location_type);
      console.log('📍 Formatted address:', result.formatted_address);
      
      // Try to extract postcode from address components
      let postcode: string | undefined;
      
      if (result.address_components) {
        // Look for postal code in address components
        const postcodeComponent = result.address_components.find(
          component => component.types.includes('postal_code')
        );
        
        if (postcodeComponent) {
          postcode = postcodeComponent.long_name;
          console.log('📫 Found postcode in address components:', postcode);
        }
      }
      
      // If we didn't find a postcode component, try to extract it from the formatted address
      if (!postcode && result.formatted_address) {
        // UK postcodes typically appear at the end of the address
        const ukPostcodeRegex = /[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}\b/i;
        const match = result.formatted_address.match(ukPostcodeRegex);
        
        if (match && match[0]) {
          postcode = match[0];
          console.log('📫 Extracted postcode from formatted address:', postcode);
        }
      }
      
      // Return coordinates in correct [lat, lng] order for consistency with other services
      // Also include the postcode if we found one
      return { 
        coordinates: [lat, lng],
        postcode
      };
    }
    
    throw new Error(`No results found for location "${locationName}"`);
  } catch (error: any) {
    console.error('❌ Error in geocoding location name:', error);
    console.error('❌ Current hostname:', window.location.hostname);
    
    // Enhanced error for timeouts
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      if (isLargeCity) {
        const specificError = new Error(
          `Timeout searching for large city "${locationName}". Try using a specific area within ${locationName} or a postcode instead.`
        );
        (specificError as any).type = 'LARGE_AREA_TIMEOUT';
        throw specificError;
      } else {
        const timeoutError = new Error(
          `The search for "${locationName}" timed out. Please try a more specific location or use a postcode.`
        );
        (timeoutError as any).type = 'LOCATION_TIMEOUT';
        throw timeoutError;
      }
    }
    
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
      
      const keyError = new Error(`Unable to use location search on ${window.location.hostname}. Please try using a UK postcode instead.`);
      (keyError as any).type = 'API_KEY_ERROR';
      throw keyError;
    }
    
    throw new Error(`Could not find coordinates for location "${locationName}": ${error.message}`);
  }
};
