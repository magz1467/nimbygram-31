
/**
 * API key management utilities
 * Handles getting and validating Google Maps API keys
 */

import { getCurrentHostname } from "@/utils/environment";

// The current valid Google Maps API key
const CURRENT_GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

/**
 * Get the Google Maps API key for the current environment
 * @returns The API key as a string
 */
export const getGoogleMapsApiKey = (): string => {
  console.log('🔑 Getting Google Maps API key');
  const hostname = getCurrentHostname();
  
  // Always use the current key for all environments
  console.log('🔑 Using key ending with:', CURRENT_GOOGLE_MAPS_API_KEY.slice(-6));
  return CURRENT_GOOGLE_MAPS_API_KEY;
};

/**
 * Get diagnostic information about the API key in use
 * @returns Object with key and hostname information
 */
export const getDiagnosticInfo = () => {
  const key = getGoogleMapsApiKey();
  const hostname = getCurrentHostname();
  
  return {
    key,
    hostname,
    keyLastSix: key.slice(-6)
  };
};
