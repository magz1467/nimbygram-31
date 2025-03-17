
/**
 * Google Maps loader - refactored version
 * Handles loading and initialization of Google Maps API
 */

// Extend Window interface to include our custom property
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
    google?: {
      maps?: any;
      // Add any other Google services that might be used
      [key: string]: any;
    };
  }
}

// Import utilities
import { resetGoogleMaps } from './utils/map-reset';
import { getFallbackCoordinates, locationToCoordinates } from '@/utils/location-fallbacks';
import { getGoogleMapsApiKey, getDiagnosticInfo } from "./utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";
import { cleanupExpiredKeyScripts } from './utils/script-cleanup';
import { useFallbackCoordinates } from './utils/fallback-loader';
import { loadGoogleMapsScript } from './utils/loader-implementation';

// Export utilities for use elsewhere
export { resetGoogleMaps as resetGoogleMapsLoader } from './utils/map-reset';
export { 
  useFallbackCoordinates
};

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * Uses a singleton pattern to prevent duplicate loading
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  // Always clean up expired key scripts first
  cleanupExpiredKeyScripts();
  
  // 🔍 DEBUGGING - API key from function
  const debugApiKey = getGoogleMapsApiKey();
  console.log('🔍 DEBUGGING - API key from function:', debugApiKey);
  console.log('🔍 DEBUGGING - Last 6 chars:', debugApiKey.slice(-6));
  
  // Log the hostname for debugging
  console.log('🌐 Current hostname:', getCurrentHostname());
  
  // Diagnostic check to log which key is being used
  const diagnostics = getDiagnosticInfo();
  console.log('🔑 Using Google Maps API key ending with:', diagnostics.keyLastSix);
  console.log('🔑 On domain:', diagnostics.hostname);
  
  // Load the Google Maps script
  return loadGoogleMapsScript();
};
