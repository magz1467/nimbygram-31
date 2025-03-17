import { detectErrorType } from "@/utils/errors";
import { fetchCoordinatesFromPlaceId } from "@/services/coordinates/fetch-coordinates-by-place-id";
import { fetchCoordinatesByLocationName } from "@/services/coordinates/fetch-coordinates-by-location-name";
import { fetchCoordinatesFromPostcodesIo } from "@/services/coordinates/fetch-coordinates-from-postcode";
import { fetchCoordinatesByAddress } from "@/services/coordinates/fetch-coordinates-by-address";
import { fetchCoordinatesFromOutcode } from "@/services/coordinates/fetch-coordinates-from-outcode";
import { fetchCoordinatesFromTown } from "@/services/coordinates/fetch-coordinates-from-town";
import { withTimeout } from "@/utils/fetchUtils";
import { useFallbackCoordinates } from "@/services/coordinates/google-maps-loader";
import { isProdDomain, getCurrentHostname } from "@/utils/environment";

// Callbacks interface to pass to strategy functions
type CoordinateCallbacks = {
  setCoordinates: (coords: [number, number]) => void;
  setPostcode: (pc: string | null) => void;
};

// Helper function for fallback with any location string
const useFallbackForLocation = (
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

// Fetch coordinates for Google Place ID
export const fetchCoordinatesForPlaceId = async (
  placeId: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  console.log('🔍 fetchCoordinatesForPlaceId:', placeId, 'on hostname:', getCurrentHostname());

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

// Fetch coordinates for town name
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

// Fetch coordinates for outcode
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

// Fetch coordinates for address
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

// Fetch coordinates for general location name
export const fetchCoordinatesForLocationName = async (
  locationName: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    console.log('🌎 Fetching coordinates for location name:', locationName);
    console.log('���� Current hostname:', window.location.hostname);
    
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
    console.error('Current hostname:', window.location.hostname);
    
    // Use fallback if API fails
    if (useFallbackForLocation(locationName, isMounted, callbacks)) {
      return;
    }
    
    throw error;
  }
};

// Fetch coordinates for postcode
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
