
import { fetchCoordinatesFromPlaceId } from "@/services/coordinates/fetch-coordinates-by-place-id";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";

/**
 * Fetch coordinates for Google Place ID
 */
export const fetchCoordinatesForPlaceId = async (
  placeId: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  console.log('🔍 fetchCoordinatesForPlaceId:', placeId, 'on hostname:', window.location.hostname);

  try {
    const coordinates = await fetchCoordinatesFromPlaceId(placeId);
    if (isMounted && coordinates) {
      callbacks.setCoordinates(coordinates);
      callbacks.setPostcode(null); // Place ID doesn't return a postcode directly
    }
  } catch (error: any) {
    console.error('Error fetching coordinates for place ID:', error);
    
    // Use fallback if API fails
    if (useFallbackForLocation(placeId, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};
