
import { getGoogleGeocoder } from "@/services/coordinates/geocoder-service";
import { ensureGoogleMapsLoaded, useFallbackCoordinates } from "@/services/coordinates/google-maps-loader";

/**
 * Fetch coordinates using Google Geocoding API
 * @param locationName The location name to geocode
 * @returns Promise with coordinates and postcode
 */
export const fetchCoordinatesByLocationName = async (locationName: string): Promise<{ coordinates: [number, number]; postcode: string | null }> => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  
  // Check if we're in production and should prioritize fallback
  const isProdDomain = window.location.hostname.includes('nimbygram.com') || 
                       window.location.hostname.includes('www.nimbygram.com') || 
                       window.location.hostname.includes('nimbygram.vercel.app');

  // In production, prioritize fallback coordinates to avoid API key issues
  if (isProdDomain) {
    console.log('🔍 Production domain detected, using fallback coordinates');
    const fallbackCoords = useFallbackCoordinates(locationName);
    
    if (fallbackCoords) {
      console.log('✅ Using fallback coordinates for location:', fallbackCoords);
      return {
        coordinates: fallbackCoords,
        postcode: null
      };
    }
  }
  
  try {
    // Enhance the search term by adding UK context if not already present
    const enhancedLocation = locationName.toLowerCase().includes('uk') 
      ? locationName 
      : `${locationName}, UK`;
    
    console.log('🔍 Enhanced search location:', enhancedLocation);
    
    // Try to load Google Maps if not in production
    if (!isProdDomain) {
      await ensureGoogleMapsLoaded();
    }
    
    // Get the geocoder service
    const geocoder = getGoogleGeocoder();
    
    if (!geocoder) {
      console.warn('⚠️ Geocoder not available, falling back to UK coordinates');
      const fallbackCoords = useFallbackCoordinates(locationName);
      
      if (fallbackCoords) {
        return {
          coordinates: fallbackCoords,
          postcode: null
        };
      }
      
      throw new Error('No geocoder available and no fallback coordinates found');
    }
    
    // Use the geocoder to get coordinates
    const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      // Add a timeout to prevent long-running searches
      const timeout = setTimeout(() => {
        reject(new Error('Timeout while searching for location'));
      }, 10000);
      
      geocoder.geocode({ address: enhancedLocation }, (results, status) => {
        clearTimeout(timeout);
        
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          resolve(results);
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
    
    // Use fallback coordinates if available
    const fallbackCoords = useFallbackCoordinates(locationName);
    
    if (fallbackCoords) {
      console.log('✅ Using fallback coordinates after error:', fallbackCoords);
      return {
        coordinates: fallbackCoords,
        postcode: null
      };
    }
    
    // Re-throw if no fallback
    throw error;
  }
};
