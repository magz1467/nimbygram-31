
import { fetchCoordinatesFromPostcodesIo } from "@/services/coordinates/fetch-coordinates-from-postcode";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";

/**
 * Fetch coordinates for postcode
 */
export const fetchCoordinatesForPostcode = async (
  postcode: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('📮 Fetching coordinates for postcode:', postcode);
    const coordinates = await fetchCoordinatesFromPostcodesIo(postcode);
    
    if (isMounted) {
      console.log('📮 Found postcode coordinates:', coordinates);
      callbacks.setCoordinates(coordinates);
      callbacks.setPostcode(postcode);
    }
  } catch (error) {
    console.error('Error fetching coordinates for postcode:', error);
    
    // Use fallback if API fails
    if (useFallbackForLocation(postcode, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};
