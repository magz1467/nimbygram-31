
import { getGoogleGeocoder, testGeocoder } from "./geocoder-service";
import { ensureGoogleMapsLoaded, useFallbackCoordinates } from "@/services/coordinates/google-maps-loader";
import { isProdDomain, getCurrentHostname } from "@/utils/environment";
import { getGoogleMapsApiKey } from "@/utils/api-keys";

/**
 * Fetch coordinates using Google Geocoding API
 * @param locationName The location name to geocode
 * @returns Promise with coordinates and postcode
 */
export const fetchCoordinatesByLocationName = async (locationName: string): Promise<{ coordinates: [number, number]; postcode: string | null }> => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  console.log('🔍 Current hostname:', getCurrentHostname());
  console.log('🔍 Using API key ending with:', getGoogleMapsApiKey().slice(-6));
  
  try {
    // Enhance the search term by adding UK context if not already present
    const enhancedLocation = locationName.toLowerCase().includes('uk') 
      ? locationName 
      : `${locationName}, UK`;
    
    console.log('🔍 Enhanced search location:', enhancedLocation);
    
    // Try to load Google Maps
    await ensureGoogleMapsLoaded();
    
    // Verify Google Maps API is working by running a test
    const testResult = await testGeocoder();
    if (!testResult.success) {
      console.warn('⚠️ Geocoder test failed:', testResult.error || testResult.status);
      console.warn('⚠️ Will use fallback coordinates instead');
      const fallbackCoords = useFallbackCoordinates(locationName);
      
      return {
        coordinates: fallbackCoords as [number, number],
        postcode: null
      };
    }
    
    // Get the geocoder service
    const geocoder = getGoogleGeocoder();
    
    if (!geocoder) {
      console.warn('⚠️ Geocoder not available, falling back to UK coordinates');
      const fallbackCoords = useFallbackCoordinates(locationName);
      
      return {
        coordinates: fallbackCoords as [number, number],
        postcode: null
      };
    }
    
    // Use the geocoder to get coordinates
    const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      // Add a timeout to prevent long-running searches
      const timeout = setTimeout(() => {
        reject(new Error('Timeout while searching for location'));
      }, 10000);
      
      geocoder.geocode({ address: enhancedLocation }, (results, status) => {
        clearTimeout(timeout);
        
        console.log('🔍 Geocoder status:', status);
        console.log('🔍 Found results:', results ? results.length : 0);
        
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
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
    
    // Extract coordinates from the first result
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
  } catch (error) {
    console.error('❌ Error fetching coordinates by location name:', error);
    console.error('❌ Current hostname:', getCurrentHostname());
    console.error('❌ API key used (last 6 chars):', getGoogleMapsApiKey().slice(-6));
    
    // Use fallback coordinates if available
    console.log('✅ Using fallback coordinates after error for:', locationName);
    const fallbackCoords = useFallbackCoordinates(locationName);
    
    return {
      coordinates: fallbackCoords as [number, number],
      postcode: null
    };
  }
};
