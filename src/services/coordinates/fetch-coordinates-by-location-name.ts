
/**
 * Core service for fetching coordinates by location name
 * Orchestrates the geocoding process using smaller focused components
 */

import { initializeGeocoder, performGeocoding } from "./location-name/geocoder-client";
import { getFallbackForLocation } from "./location-name/fallback-handler";
import { logGeocodeDebugInfo, logGeocodeError } from "./location-name/utils";
import { useFallbackCoordinates } from "./google-maps-loader";
import { getFallbackCoordinates, locationToCoordinates } from "@/utils/location-fallbacks";

/**
 * Fetch coordinates using Google Geocoding API with fallback mechanisms
 * @param locationName The location name to geocode
 * @returns Promise with coordinates and postcode
 */
export const fetchCoordinatesByLocationName = async (locationName: string): Promise<{ coordinates: [number, number]; postcode: string | null }> => {
  // Log debug information
  logGeocodeDebugInfo(locationName);
  
  try {
    // Check for the global API key set by fixApiKey.js
    const usingGlobalKey = typeof window !== 'undefined' && window.__GOOGLE_MAPS_API_KEY;
    
    if (usingGlobalKey) {
      console.log('✅ Using global API key override for location:', locationName);
      console.log('✅ API key ends with:', window.__GOOGLE_MAPS_API_KEY!.slice(-6));
    }
    
    // Initialize the geocoder
    const geocoderInit = await initializeGeocoder();
    
    if (!geocoderInit.success || !geocoderInit.geocoder) {
      console.warn('⚠️ Geocoder initialization failed, using fallback:', geocoderInit.error);
      
      // Try fallback coordinates
      const fallbackCoords = useFallbackCoordinates(locationName);
      
      if (fallbackCoords) {
        // Important: Don't hardcode a postcode here, return null instead
        // This allows the system to use the coordinates directly
        return {
          coordinates: fallbackCoords,
          postcode: null
        };
      }
      
      // If useFallbackCoordinates fails, use the generic fallback
      const fallbackResult = getFallbackForLocation(locationName);
      
      // Don't include a hardcoded postcode in the fallback
      return {
        coordinates: fallbackResult.coordinates,
        postcode: null 
      };
    }
    
    // Perform the geocoding
    const geocodingResult = await performGeocoding(geocoderInit.geocoder, locationName);
    
    // Return the coordinates but don't force a postcode if we don't have one
    return {
      coordinates: geocodingResult.coordinates,
      postcode: geocodingResult.postcode
    };
    
  } catch (error) {
    // Log the error
    logGeocodeError(error);
    
    // Return fallback coordinates without forcing a postcode
    const fallback = getFallbackForLocation(locationName);
    return {
      coordinates: fallback.coordinates,
      postcode: null // Don't force a postcode
    };
  }
};
