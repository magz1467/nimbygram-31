/**
 * Google Maps loader - refactored version
 * Handles loading and initialization of Google Maps API
 */

// Extend Window interface to include our custom property
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
  }
}

// Import utilities
import { resetGoogleMaps } from './utils/map-reset';
import { getFallbackCoordinates, locationToCoordinates } from '@/utils/location-fallbacks';
import { getGoogleMapsApiKey, diagnoseApiKey } from "@/utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";

// Export utilities for use elsewhere
export { resetGoogleMaps as resetGoogleMapsLoader } from './utils/map-reset';
export { 
  checkApiKeyDomainRestrictions, 
  diagnoseApiKeyIssues, 
  getGoogleMapsApiKeyForDebugging as getGoogleMapsApiKey 
} from './utils/api-validation';

// Keep track of loading state to prevent duplicate loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;
let loadRetries = 0;
const MAX_RETRIES = 2;

/**
 * Provides fallback coordinates for location names
 * @param locationName Location to find coordinates for
 * @returns Coordinates tuple or null
 */
export const useFallbackCoordinates = (locationName: string): [number, number] | null => {
  const fallbackLocation = getFallbackCoordinates(locationName);
  return fallbackLocation ? locationToCoordinates(fallbackLocation) : null;
};

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * Uses a singleton pattern to prevent duplicate loading
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  // 🔍 DEBUGGING - API key from function
  const debugApiKey = getGoogleMapsApiKey();
  console.log('🔍 DEBUGGING - API key from function:', debugApiKey);
  console.log('🔍 DEBUGGING - Last 6 chars:', debugApiKey.slice(-6));
  
  // Log the hostname for debugging
  console.log('🌐 Current hostname:', getCurrentHostname());
  
  // Diagnostic check to log which key is being used
  const diagnostics = diagnoseApiKey();
  console.log('🔑 Using Google Maps API key ending with:', diagnostics.key.slice(-6));
  console.log('🔑 On domain:', diagnostics.hostname);
  
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps) {
    console.log('Google Maps already loaded, reusing existing instance');
    return Promise.resolve();
  }
  
  // If there was a previous error, retry up to MAX_RETRIES times
  if (loadError) {
    console.warn('Previous Google Maps loading error:', loadError);
    if (loadRetries < MAX_RETRIES) {
      console.log(`Retrying Google Maps load (attempt ${loadRetries + 1}/${MAX_RETRIES})`);
      loadRetries++;
      loadError = null;
      isLoading = false;
      loadPromise = null;
      
      // Force complete reset before retrying
      resetGoogleMaps(true);
      
      console.log('Complete reset performed before retry');
    } else {
      // For preview compatibility - don't fail but proceed with fallback coordinates for major cities
      console.warn(`Max retries (${MAX_RETRIES}) reached for Google Maps loading, will use fallback coordinates`);
      // Instead of rejecting, resolve so that the fallback coordinates can be used
      return Promise.resolve();
    }
  }
  
  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    console.log('Google Maps script currently loading, waiting for completion');
    return loadPromise;
  }
  
  // Create a new loading promise
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
      // First, do a complete cleanup of any existing Google Maps scripts
      resetGoogleMaps(true);
      
      // Double-check if script is already loaded after cleanup
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps API already available in window object after cleanup');
        isLoaded = true;
        isLoading = false;
        loadError = null;
        resolve();
        return;
      }
      
      // Get the API key from our centralized utility - always use the same key
      const apiKey = getGoogleMapsApiKey();
      
      console.log('Loading Google Maps script...');
      console.log('Current hostname:', getCurrentHostname());
      console.log('Using API key that ends with:', apiKey.slice(-6));
      
      // 🔍 DEBUGGING - Script URL being used
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding,geometry&v=quarterly&callback=googleMapsLoaded`;
      console.log('🔍 DEBUGGING - Script URL being used:', scriptUrl.replace(apiKey, 'API_KEY_REDACTED'));
      
      // Create script element with explicit libraries
      const script = document.createElement('script');
      
      // IMPORTANT: Ensure we're using the consistent key here
      // Add all necessary libraries: places, geocoding, geometry
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script'; // Add ID for easier identification
      
      // Create a promise that will resolve with the script load event
      window.googleMapsLoaded = () => {
        console.log('Google Maps script loaded via callback function');
        
        // Wait a short time to ensure all objects are available
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps API objects confirmed available');
            console.log('Script used key ending with:', apiKey.slice(-6));
            isLoaded = true;
            isLoading = false;
            loadError = null;
            resolve();
          } else {
            console.warn('Google Maps objects not available after script loaded');
            // Force reset and try again with fallback
            resetGoogleMaps(true);
            isLoading = false;
            // Instead of rejecting, resolve so that the fallback coordinates can be used
            resolve();
          }
        }, 300);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        console.error('Current hostname:', getCurrentHostname());
        console.error('API key used (last 6 chars):', apiKey.slice(-6));
        console.error('Full script URL:', script.src.replace(apiKey, 'API_KEY_REDACTED'));
        
        // Reset for a clean state on next try
        resetGoogleMaps(true);
        
        console.warn('Google Maps script failed to load, will use fallback coordinates');
        isLoading = false;
        loadError = error instanceof Error ? error : new Error('Script loading error');
        // Instead of rejecting, resolve so that the fallback coordinates can be used
        resolve();
      };
      
      document.head.appendChild(script);
      
      // Set a timeout to resolve even if the script doesn't load properly
      // This ensures we can proceed with fallback coordinates in preview
      setTimeout(() => {
        if (isLoading) {
          console.warn('Google Maps script loading timed out, will use fallback coordinates');
          // Reset for a clean state on next try
          resetGoogleMaps(true);
          isLoading = false;
          loadError = new Error('Script loading timeout');
          // Instead of rejecting, resolve so that the fallback coordinates can be used
          resolve();
        }
      }, 10000); // 10 second script load timeout
      
    } catch (error) {
      console.error('Unexpected error loading Google Maps:', error);
      
      // Reset for a clean state on next try
      resetGoogleMaps(true);
      
      // For preview compatibility - don't fail but proceed with fallback coordinates
      console.warn('Unexpected error in Google Maps loading, will use fallback coordinates');
      isLoading = false;
      loadError = error instanceof Error ? error : new Error(String(error));
      // Instead of rejecting, resolve so that the fallback coordinates can be used
      resolve();
    }
  });
  
  return loadPromise;
};
