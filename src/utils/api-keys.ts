
/**
 * Centralized API key management
 * This ensures we use consistent API keys across the application
 */

// Import environment detection utility
import { getCurrentHostname } from "@/utils/environment";

// The current valid Google Maps API key - IMPORTANT: DO NOT CHANGE THIS KEY
const CURRENT_GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

/**
 * Get the appropriate Google Maps API key for the current environment and domain
 * This provides a single source of truth for the API key
 */
export const getGoogleMapsApiKey = (): string => {
  // Check for the global override from fixApiKey.js
  if (typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY) {
    console.log('🔑 Using globally forced API key ending with:', (window as any).__GOOGLE_MAPS_API_KEY.slice(-6));
    return (window as any).__GOOGLE_MAPS_API_KEY;
  }
  
  // Log to help identify where the key is being retrieved
  console.log('🔑 Retrieving Google Maps API key from standard function');
  
  // Get the current hostname
  const hostname = getCurrentHostname();
  console.log('📍 Current hostname:', hostname);
  
  // Check if we're in a sandbox environment
  const isSandbox = hostname === 'server' || 
                    hostname.includes('localhost') || 
                    hostname.includes('sandbox') ||
                    hostname.includes('lovable');
  
  if (isSandbox) {
    console.log('🏝️ Running in sandbox/development environment');
  }
  
  // IMPORTANT: Always use the CURRENT_GOOGLE_MAPS_API_KEY for all environments
  // This ensures consistency and prevents API key mismatches
  console.log('🔑 Returning key ending with:', CURRENT_GOOGLE_MAPS_API_KEY.slice(-6));
  return CURRENT_GOOGLE_MAPS_API_KEY;
};

/**
 * Diagnostic function to check API key status
 * This helps identify which key is being used and if there are any issues
 */
export const diagnoseApiKey = (): { key: string, hostname: string, source: string } => {
  // Check for the global override
  const usingGlobalKey = typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY;
  
  const key = getGoogleMapsApiKey();
  const hostname = getCurrentHostname();
  const source = usingGlobalKey ? 'Global override' : 'Function';
  
  console.log('🔍 API key diagnosis:');
  console.log('- Hostname:', hostname);
  console.log('- Using key ending with:', key.slice(-6));
  console.log('- Source:', source);
  
  return {
    key: key,
    hostname: hostname,
    source: source
  };
};
