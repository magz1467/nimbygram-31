
/**
 * Fallback handler for location name searches
 * Provides fallback mechanisms when geocoding fails
 */

import { getFallbackCoordinates, locationToCoordinates } from "@/utils/location-fallbacks";
import { getCurrentHostname } from "@/utils/environment";

/**
 * Returns fallback coordinates for a location when geocoding fails
 * @param locationName Location to find fallback coordinates for
 * @returns Object with coordinates and null postcode
 */
export const getFallbackForLocation = (locationName: string) => {
  console.log('✅ Using fallback coordinates after error for:', locationName);
  console.log('Current hostname:', getCurrentHostname());
  
  const fallbackLocation = getFallbackCoordinates(locationName);
  const fallbackCoords = locationToCoordinates(fallbackLocation);
  
  console.log('✅ Using fallback coordinates:', fallbackCoords);
  
  return {
    coordinates: fallbackCoords,
    postcode: null
  };
};
