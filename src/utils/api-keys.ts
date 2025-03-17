
/**
 * Centralized API key management
 * This ensures we use consistent API keys across the application
 */

// Import environment detection utility
import { getCurrentHostname } from "@/utils/environment";

// The current valid Google Maps API key
const CURRENT_GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

// For testing/debugging - DO NOT USE IN PRODUCTION
const DEV_GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

/**
 * Get the appropriate Google Maps API key for the current environment and domain
 * This provides a single source of truth for the API key
 */
export const getGoogleMapsApiKey = (): string => {
  // Log to help identify where the key is being retrieved
  console.log('🔑 Retrieving Google Maps API key');
  
  // Get the current hostname
  const hostname = getCurrentHostname();
  console.log('📍 Current hostname:', hostname);
  
  // Production domain check (nimbygram.com)
  const isProd = hostname.includes('nimbygram.com');
  console.log('🌎 Is production domain?', isProd);
  
  // Local development check
  const isDev = hostname === 'localhost' || hostname.includes('127.0.0.1');
  console.log('🛠️ Is development environment?', isDev);
  
  // IMPORTANT: Always use the CURRENT_GOOGLE_MAPS_API_KEY for all environments
  // This ensures consistency and prevents API key mismatches
  return CURRENT_GOOGLE_MAPS_API_KEY;
};

/**
 * Diagnostic function to check API key status
 * This helps identify which key is being used and if there are any issues
 */
export const diagnoseApiKey = (): { key: string, hostname: string } => {
  const key = getGoogleMapsApiKey();
  const hostname = getCurrentHostname();
  
  console.log('🔍 API key diagnosis:');
  console.log('- Hostname:', hostname);
  console.log('- Using key ending with:', key.slice(-6));
  
  // Additional validation for nimbygram.com
  if (hostname.includes('nimbygram.com')) {
    console.log('- Using production key for nimbygram.com domain');
  }
  
  return {
    key: key,
    hostname: hostname
  };
};
