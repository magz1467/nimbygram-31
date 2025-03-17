
import { fetchCoordinatesByLocationName } from "@/services/coordinates/fetch-coordinates-by-location-name";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";
import { getCurrentHostname } from "@/utils/environment";
import { withTimeout } from "@/utils/fetchUtils";

/**
 * Fetch coordinates for general location name
 */
export const fetchCoordinatesForLocationName = async (
  locationName: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('🌎 Fetching coordinates for location name:', locationName);
    console.log('🌎 Current hostname:', getCurrentHostname());
    
    // Determine if this is a large city that needs special handling
    const isLargeCity = /\b(london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|newcastle|bristol|cardiff|belfast)\b/i.test(locationName);
    
    // Increase timeout for large cities
    const timeoutMs = isLargeCity ? 30000 : 15000; // 30 seconds for large cities, 15 for others
    
    console.log(`🌎 Using ${timeoutMs}ms timeout for ${isLargeCity ? 'large city' : 'location'}: ${locationName}`);
    
    // Create a search promise
    const searchPromise = fetchCoordinatesByLocationName(locationName);
    
    // Apply timeout
    const result = await withTimeout(
      searchPromise,
      timeoutMs,
      isLargeCity
        ? `Timeout searching for large city "${locationName}". Try a more specific area within ${locationName} or a postcode.`
        : `Timeout searching for location "${locationName}". Try a more specific location or postcode.`
    );
    
    if (isMounted && result) {
      console.log('🌎 Found location coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode || null);
    }
  } catch (error: any) {
    console.error('Error fetching coordinates for location name:', error);
    console.error('Current hostname:', getCurrentHostname());
    
    // Use fallback if API fails
    if (useFallbackForLocation(locationName, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};
