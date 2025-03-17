
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
    __GOOGLE_MAPS_API_KEY?: string;
    getGoogleMapsApiKey?: () => string;
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
  
  // Use the global API key if it's available (from fixApiKey.js)
  const apiKey = typeof window !== 'undefined' && window.__GOOGLE_MAPS_API_KEY 
    ? window.__GOOGLE_MAPS_API_KEY 
    : getGoogleMapsApiKey();
  
  // 🔍 DEBUGGING - API key from global or function
  console.log('🔍 DEBUGGING - API key:', apiKey);
  console.log('🔍 DEBUGGING - Last 6 chars:', apiKey.slice(-6));
  console.log('🔍 DEBUGGING - Source:', window.__GOOGLE_MAPS_API_KEY ? 'Global override' : 'Function');
  
  // Log the hostname for debugging
  console.log('🌐 Current hostname:', getCurrentHostname());
  
  // Load the Google Maps script
  return loadGoogleMapsScript();
};
