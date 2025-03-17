
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
        return {
          coordinates: fallbackCoords,
          postcode: null
        };
      }
      
      // If useFallbackCoordinates fails, use the generic fallback
      return getFallbackForLocation(locationName);
    }
    
    // Perform the geocoding
    return await performGeocoding(geocoderInit.geocoder, locationName);
    
  } catch (error) {
    // Log the error
    logGeocodeError(error);
    
    // Return fallback coordinates
    return getFallbackForLocation(locationName);
  }
};
