
import { fetchCoordinatesFromTown } from "@/services/coordinates/fetch-coordinates-from-town";
import { fetchCoordinatesForLocationName } from "./location-name-strategy";
import { CoordinateCallbacks } from "../types/coordinate-callbacks";
import { useFallbackForLocation } from "../utils/fallback-utils";
import { withTimeout } from "@/utils/fetchUtils";

/**
 * Fetch coordinates for town name
 */
export const fetchCoordinatesForTown = async (
  townName: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('🏙️ Fetching coordinates for town:', townName);
    console.log('🏙️ Current hostname:', window.location.hostname);
    
    // Determine if this is a large city that needs special handling
    const isLargeCity = /\b(london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|newcastle|bristol|cardiff|belfast)\b/i.test(townName);
    
    // Increase timeout for large cities
    const timeoutMs = isLargeCity ? 30000 : 20000; // 30 seconds for large cities, 20 for others
    
    console.log(`🏙️ Using ${timeoutMs}ms timeout for ${isLargeCity ? 'large city' : 'town'}: ${townName}`);
    
    // Create a timeout promise
    const searchPromise = fetchCoordinatesFromTown(townName);
    
    // Add type assertion to handle the unknown type
    const result = await withTimeout(
      searchPromise,
      timeoutMs,
      isLargeCity
        ? `Timeout searching for large city "${townName}". Try a more specific area within ${townName} or a postcode.`
        : `Timeout searching for town "${townName}". Try a more specific location or postcode.`
    ) as { 
      coordinates: [number, number]; 
      postcode: string | null;
    };
    
    if (isMounted && result) {
      console.log('🏙️ Found town coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode);
      return;
    }
    
    // Fallback to location name search if town search didn't give valid results
    if (!result || !result.coordinates) {
      console.log('🏙️ Town search failed, falling back to location name search');
      await fetchCoordinatesForLocationName(townName, isMounted, callbacks);
    }
  } catch (error: any) {
    console.error('Error fetching town coordinates:', error);
    console.error('Current hostname:', window.location.hostname);
    
    // Use fallback if API fails
    if (useFallbackForLocation(townName, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};
