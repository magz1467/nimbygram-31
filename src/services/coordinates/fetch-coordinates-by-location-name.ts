import { getGoogleGeocoder, testGeocoder } from "./geocoder-service";
import { ensureGoogleMapsLoaded, useFallbackCoordinates } from "@/services/coordinates/google-maps-loader";
import { isProdDomain, getCurrentHostname } from "@/utils/environment";
import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getFallbackCoordinates, locationToCoordinates } from "@/utils/location-fallbacks";

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
    
    // TEMPORARY: Always use fallback coordinates while fixing the API key
    // This ensures your app keeps working while the API key issue is resolved
    const fallbackLocation = getFallbackCoordinates(locationName);
    const fallbackCoords = locationToCoordinates(fallbackLocation);
    
    console.log('✅ Using fallback coordinates for location:', locationName);
    console.log('✅ Fallback coordinates:', fallbackCoords);
    
    return {
      coordinates: fallbackCoords,
      postcode: null
    };
    
    // The remaining code is kept but will be skipped during the temporary fallback period
    // Once the API key is confirmed working, you can remove the early return above
    
    // Run a preemptive test of the geocoder to check if API key is working
    const testResult = await testGeocoder();
    console.log('🧪 Geocoder test result:', testResult);

    if (!testResult.success) {
      console.warn('⚠️ Geocoder test failed, will try loading maps again:', testResult.error || testResult.status);
      
      // Try to reload Google Maps
      await ensureGoogleMapsLoaded();
      
      // Run the test again after reloading
      const retestResult = await testGeocoder();
      console.log('🧪 Geocoder retest result:', retestResult);
      
      if (!retestResult.success) {
        console.warn('⚠️ Geocoder retest also failed, using fallback coordinates');
        const fallbackCoords = useFallbackCoordinates(locationName);
        
        return {
          coordinates: fallbackCoords as [number, number],
          postcode: null
        };
      }
    }
    
    // Get the geocoder service
    const geocoder = getGoogleGeocoder();
    
    if (!geocoder) {
      console.warn('⚠️ Geocoder not available after tests passed, using fallback coordinates');
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
          console.error('🔍 API key ending with:', getGoogleMapsApiKey().slice(-6));
          console.error('🔍 Hostname:', getCurrentHostname());
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
    const fallbackLocation = getFallbackCoordinates(locationName);
    const fallbackCoords = locationToCoordinates(fallbackLocation);
    
    return {
      coordinates: fallbackCoords,
      postcode: null
    };
  }
};
