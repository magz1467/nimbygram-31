
import { detectErrorType } from "@/utils/errors";
import { fetchCoordinatesFromPlaceId } from "@/services/coordinates/fetch-coordinates-by-place-id";
import { fetchCoordinatesByLocationName } from "@/services/coordinates/fetch-coordinates-by-location-name";
import { fetchCoordinatesFromPostcodesIo } from "@/services/coordinates/fetch-coordinates-from-postcode";
import { fetchCoordinatesByAddress } from "@/services/coordinates/fetch-coordinates-by-address";
import { fetchCoordinatesFromOutcode } from "@/services/coordinates/fetch-coordinates-from-outcode";
import { fetchCoordinatesFromTown } from "@/services/coordinates/fetch-coordinates-from-town";

// Callbacks interface to pass to strategy functions
type CoordinateCallbacks = {
  setCoordinates: (coords: [number, number]) => void;
  setPostcode: (pc: string | null) => void;
};

// Fetch coordinates for Google Place ID
export const fetchCoordinatesForPlaceId = async (
  placeId: string, 
  isMounted: boolean, 
  callbacks: CoordinateCallbacks
) => {
  try {
    const coordinates = await fetchCoordinatesFromPlaceId(placeId);
    if (isMounted && coordinates) {
      callbacks.setCoordinates(coordinates);
      callbacks.setPostcode(null); // Place ID doesn't return a postcode directly
    }
  } catch (error) {
    console.error('Error fetching coordinates for place ID:', error);
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
    
    // Increase timeout for large cities
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Town search timeout')), 20000); // 20 seconds timeout
    });
    
    const searchPromise = fetchCoordinatesFromTown(townName);
    
    // Add type assertion to handle the unknown type
    const result = await Promise.race([searchPromise, timeoutPromise]) as { 
      coordinates: [number, number]; 
      postcode: string | null;
    };
    
    if (isMounted && result) {
      console.log('🏙️ Found town coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode);
      return;
    }
    
    // Fallback to location name search with increased timeout
    console.log('🏙️ Town search failed, falling back to location name search');
    await fetchCoordinatesForLocationName(townName, isMounted, callbacks);
  } catch (error) {
    console.error('Error fetching town coordinates:', error);
    await fetchCoordinatesForLocationName(townName, isMounted, callbacks);
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
    const result = await fetchCoordinatesByLocationName(locationName);
    
    if (isMounted && result) {
      console.log('🌎 Found location coordinates:', result);
      callbacks.setCoordinates(result.coordinates);
      callbacks.setPostcode(result.postcode || null);
    }
  } catch (error) {
    console.error('Error fetching coordinates for location name:', error);
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
    throw error;
  }
};
