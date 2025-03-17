
import { fetchCoordinatesByAddress } from "@/services/coordinates/fetch-coordinates-by-address";
import { fetchCoordinatesForLocationName } from "./location-name-strategy";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";

/**
 * Fetch coordinates for address
 */
export const fetchCoordinatesForAddress = async (
  address: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('🏠 Fetching coordinates for address:', address);
    const result = await fetchCoordinatesByAddress(address);
    
    if (isMounted && result) {
      console.log('🏠 Found address coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode || null);
    }
  } catch (error) {
    console.error('Error fetching coordinates for address:', error);
    
    // Use fallback if API fails
    if (useFallbackForLocation(address, isMounted, callbacks)) {
      return;
    }
    
    // If address geocoding fails, try as a general location
    console.log('🏠 Address search failed, falling back to location name search');
    await fetchCoordinatesForLocationName(address, isMounted, callbacks);
  }
};
