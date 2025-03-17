
/**
 * Centralized API key management
 * This ensures we use consistent API keys across the application
 */

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
  const hostname = window.location.hostname;
  console.log('📍 Current hostname:', hostname);
  
  // Production domain check (nimbygram.com)
  const isProd = hostname.includes('nimbygram.com');
  console.log('🌎 Is production domain?', isProd);
  
  // Local development check
  const isDev = hostname === 'localhost' || hostname.includes('127.0.0.1');
  console.log('🛠️ Is development environment?', isDev);
  
  // Always use the current key for all environments
  return CURRENT_GOOGLE_MAPS_API_KEY;
};

/**
 * Diagnostic function to check API key status
 * This helps identify which key is being used and if there are any issues
 */
export const diagnoseApiKey = (): { key: string, hostname: string } => {
  const key = getGoogleMapsApiKey();
  const hostname = window.location.hostname;
  
  console.log('🔍 API key diagnosis:');
  console.log('- Hostname:', hostname);
  console.log('- Using key ending with:', key.slice(-6));
  
  return {
    key: key,
    hostname: hostname
  };
};
