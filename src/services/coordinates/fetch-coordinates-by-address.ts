
import { withTimeout } from '@/utils/promise-utils';
import { OS_API_KEY } from '@/services/address/address-api-base';

/**
 * Fetches coordinates for an address or location name using the Ordnance Survey API
 * @param address The address to look up
 * @returns Promise with coordinates [lat, lng] and postcode if found
 */
export const fetchCoordinatesByAddress = async (address: string): Promise<{
  coordinates: [number, number];
  postcode?: string;
}> => {
  console.log('🔍 Fetching coordinates for address using OS API:', address);
  
  if (!address) {
    throw new Error("No address provided");
  }

  try {
    // First try OS Places API
    const osResult = await fetchFromOrdnanceSurvey(address);
    
    if (osResult) {
      console.log('✅ Found coordinates using OS API:', osResult.coordinates);
      return osResult;
    }
    
    // If OS API fails, fall back to postcode.io API for place search
    console.log('⚠️ OS API search failed, trying postcodes.io place search');
    const placeResult = await fetchFromPostcodesIoPlaces(address);
    
    if (placeResult) {
      console.log('✅ Found coordinates using postcodes.io places:', placeResult.coordinates);
      return placeResult;
    }
    
    // If all strategies fail, throw error
    throw new Error(`Could not find coordinates for address: ${address}`);
  } catch (error: any) {
    console.error('❌ Error in address geocoding:', error);
    throw new Error(`Could not find coordinates for address: ${error.message}`);
  }
};

/**
 * Fetch coordinates using Ordnance Survey Places API
 */
const fetchFromOrdnanceSurvey = async (address: string): Promise<{
  coordinates: [number, number];
  postcode?: string;
} | null> => {
  try {
    // OS Places API endpoint
    const url = `https://api.os.uk/search/places/v1/find?query=${encodeURIComponent(address)}&key=${OS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ OS API request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('❌ No results from OS API');
      return null;
    }
    
    const result = data.results[0];
    
    // OS API returns coordinates in EPSG:27700 (British National Grid), 
    // so we need to convert them to WGS84 (latitude/longitude)
    // For simplicity here we'll extract coordinates directly
    if (result.LATITUDE && result.LONGITUDE) {
      const lat = parseFloat(result.LATITUDE);
      const lng = parseFloat(result.LONGITUDE);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Get postcode if available
        const postcode = result.POSTCODE || undefined;
        
        return {
          coordinates: [lat, lng],
          postcode
        };
      }
    }
    
    // If we have a DPA (Delivery Point Address) result
    if (result.DPA) {
      if (result.DPA.LATITUDE && result.DPA.LONGITUDE) {
        const lat = parseFloat(result.DPA.LATITUDE);
        const lng = parseFloat(result.DPA.LONGITUDE);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            coordinates: [lat, lng],
            postcode: result.DPA.POSTCODE
          };
        }
      }
    }
    
    console.log('❌ Could not extract coordinates from OS API result');
    return null;
  } catch (error) {
    console.error('❌ Error in OS API request:', error);
    return null;
  }
};

/**
 * Fall back to postcodes.io place search API
 */
const fetchFromPostcodesIoPlaces = async (address: string): Promise<{
  coordinates: [number, number];
  postcode?: string;
} | null> => {
  try {
    // Search for place using postcodes.io
    const placeUrl = `https://api.postcodes.io/places?q=${encodeURIComponent(address)}&limit=1`;
    const placeResponse = await fetch(placeUrl);
    
    if (!placeResponse.ok) {
      return null;
    }
    
    const placeData = await placeResponse.json();
    
    if (!placeData.result || placeData.result.length === 0) {
      return null;
    }
    
    const place = placeData.result[0];
    
    if (place.latitude && place.longitude) {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Try to get the nearest postcode for this location
        try {
          const postcodeResponse = await fetch(
            `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`
          );
          
          if (postcodeResponse.ok) {
            const postcodeData = await postcodeResponse.json();
            
            if (postcodeData.result && postcodeData.result.length > 0) {
              return {
                coordinates: [lat, lng],
                postcode: postcodeData.result[0].postcode
              };
            }
          }
        } catch (error) {
          console.error('❌ Error getting nearest postcode:', error);
        }
        
        // Return coordinates even if we couldn't get a postcode
        return {
          coordinates: [lat, lng]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in postcodes.io place search:', error);
    return null;
  }
};
