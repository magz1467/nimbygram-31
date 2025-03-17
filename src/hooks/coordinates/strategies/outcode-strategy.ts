
import { fetchCoordinatesFromOutcode } from "@/services/coordinates/fetch-coordinates-from-outcode";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";

/**
 * Fetch coordinates for outcode
 */
export const fetchCoordinatesForOutcode = async (
  outcode: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('📮 Fetching coordinates for outcode:', outcode);
    const result = await fetchCoordinatesFromOutcode(outcode);
    
    if (isMounted && result) {
      console.log('📮 Found outcode coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode || outcode);
    }
  } catch (error) {
    console.error('Error fetching coordinates for outcode:', error);
    
    // Use fallback if API fails
    if (useFallbackForLocation(outcode, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};
