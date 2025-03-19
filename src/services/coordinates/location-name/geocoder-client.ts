
/**
 * Geocoder client for location name searches
 * Handles communication with Google Geocoding API
 */

import { getGoogleGeocoder, testGeocoder } from "../geocoder-service";
import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";
import { ensureGoogleMapsLoaded } from "../google-maps-loader";

/**
 * Result of a geocoding operation
 */
export interface GeocodingResult {
  coordinates: [number, number];
  postcode: string | null;
}

/**
 * Initializes and tests the geocoder service
 * @returns Promise that resolves to a test result object
 */
export const initializeGeocoder = async (): Promise<{ 
  success: boolean; 
  error?: string;
  geocoder?: google.maps.Geocoder;
}> => {
  console.log('🔍 Initializing geocoder');
  console.log('🔍 Current hostname:', getCurrentHostname());
  console.log('🔍 Using API key ending with:', getGoogleMapsApiKey().slice(-6));
  
  try {
    // Test if the geocoder is working
    const testResult = await testGeocoder();
    console.log('🧪 Geocoder test result:', testResult);

    if (!testResult.success) {
      console.warn('⚠️ Geocoder test failed, trying to reload Maps:', testResult.error || testResult.status);
      
      // Try to reload Google Maps
      await ensureGoogleMapsLoaded();
      
      // Run the test again after reloading
      const retestResult = await testGeocoder();
      console.log('🧪 Geocoder retest result:', retestResult);
      
      if (!retestResult.success) {
        return {
          success: false,
          error: `Geocoder failed after reload: ${retestResult.error || retestResult.status}`
        };
      }
    }
    
    // Get the geocoder instance
    const geocoder = getGoogleGeocoder();
    
    if (!geocoder) {
      return {
        success: false,
        error: 'Geocoder not available after tests passed'
      };
    }
    
    return {
      success: true,
      geocoder
    };
  } catch (error) {
    console.error('❌ Error initializing geocoder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Performs geocoding for a location name
 * @param geocoder Google Maps Geocoder instance
 * @param locationName Location to geocode
 * @returns Promise with geocoding result
 */
export const performGeocoding = async (
  geocoder: google.maps.Geocoder, 
  locationName: string
): Promise<GeocodingResult> => {
  // Add UK context if not already present
  const enhancedLocation = locationName.toLowerCase().includes('uk') 
    ? locationName 
    : `${locationName}, UK`;
  
  console.log('🔍 Enhanced search location:', enhancedLocation);
  
  // Special case handling for known locations that may have issues
  if (locationName.toLowerCase().includes('broadstairs')) {
    console.log('🔍 Using direct coordinates for Broadstairs, Kent');
    return {
      coordinates: [51.3603, 1.4322],
      postcode: null
    };
  }
  
  // Use the geocoder to get coordinates
  const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
    // Add a timeout to prevent long-running searches
    const timeout = setTimeout(() => {
      reject(new Error('Timeout while searching for location'));
    }, 10000);
    
    // Create bounds for UK using LatLng objects
    const ukSW = new google.maps.LatLng(50.0000, -8.6500); // Southwest corner
    const ukNE = new google.maps.LatLng(58.6350, 1.7800);  // Northeast corner
    const ukBounds = new google.maps.LatLngBounds(ukSW, ukNE);
    
    geocoder.geocode({ 
      address: enhancedLocation,
      // Add region biasing to improve UK results
      region: 'uk',
      // Add bounds biasing to UK
      bounds: ukBounds
    }, (results, status) => {
      clearTimeout(timeout);
      
      console.log('🔍 Geocoder status:', status);
      console.log('🔍 Found results:', results ? results.length : 0);
      
      if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
        // Print the first result to help debug
        if (results[0]) {
          console.log('🔍 First result:', {
            formattedAddress: results[0].formatted_address,
            location: {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            },
            types: results[0].types
          });
        }
        resolve(results);
      } else if (status === google.maps.GeocoderStatus.ERROR || 
                status === google.maps.GeocoderStatus.INVALID_REQUEST || 
                status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        console.error('🔍 Geocoder API key or request error:', status);
        reject(new Error(`Geocoder API error: ${status}`));
      } else {
        reject(new Error(`Geocoder failed with status: ${status}`));
      }
    });
  });
  
  // Extract information from the first result
  const location = results[0].geometry.location;
  const lat = location.lat();
  const lng = location.lng();
  
  console.log('✅ Found coordinates:', [lat, lng]);
  
  // Extract postcode if available
  let postcode: string | null = null;
  const postcodeComponent = results[0].address_components.find(
    component => component.types.includes('postal_code')
  );
  
  if (postcodeComponent) {
    postcode = postcodeComponent.short_name;
    console.log('✅ Found postcode:', postcode);
  }
  
  return {
    coordinates: [lat, lng],
    postcode
  };
}
