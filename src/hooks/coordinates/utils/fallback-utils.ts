
import { getCurrentHostname } from "@/utils/environment";
import { useFallbackCoordinates } from "@/services/coordinates/google-maps-loader";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";

/**
 * Helper function for fallback with any location string
 */
export const useFallbackForLocation = (
  locationString: string,
  isMounted: boolean,
  callbacks: CoordinateCallbacks
): boolean => {
  console.log(`🔍 Using fallback for "${locationString}" on ${getCurrentHostname()}`);
  const fallbackCoords = useFallbackCoordinates(locationString);
  
  if (fallbackCoords && isMounted) {
    console.log(`🏁 Using fallback coordinates for "${locationString}":`, fallbackCoords);
    callbacks.setCoordinates(fallbackCoords);
    callbacks.setPostcode(null);
    return true;
  }
  
  return false;
};
