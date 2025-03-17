
/**
 * Google Maps loader implementation
 * Core functionality for loading Google Maps API
 */

import { getGoogleMapsApiKey } from './api-keys';
import { cleanupExpiredKeyScripts } from './script-cleanup';
import { isGoogleMapsLoaded } from './fallback-loader';
import { resetGoogleMaps } from './map-reset';

// State tracking variables
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;
let loadRetries = 0;
const MAX_RETRIES = 2;

// Hardcoded correct API key - eliminates any possible variability
const CORRECT_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

/**
 * Load the Google Maps script
 * @returns Promise that resolves when Google Maps is loaded
 */
export const loadGoogleMapsScript = async (): Promise<void> => {
  // Always clean up expired key scripts first
  cleanupExpiredKeyScripts();
  
  // Log the API key being used
  console.log('🔍 DEBUGGING - API key from function:', getGoogleMapsApiKey());
  console.log('🔍 DEBUGGING - Last 6 chars:', getGoogleMapsApiKey().slice(-6));
  
  // If already loaded, resolve immediately
  if (isLoaded && isGoogleMapsLoaded()) {
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
      if (isGoogleMapsLoaded()) {
        console.log('Google Maps API already available in window object after cleanup');
        isLoaded = true;
        isLoading = false;
        loadError = null;
        resolve();
        return;
      }
      
      // Use the hardcoded correct API key directly
      console.log('Loading Google Maps script with key ending with:', CORRECT_API_KEY.slice(-6));
      
      // Create script element with explicit libraries and the correct hardcoded key
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${CORRECT_API_KEY}&libraries=places,geocoding,geometry&v=quarterly&callback=googleMapsLoaded`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script'; // Add ID for easier identification
      
      // Create a promise that will resolve with the script load event
      window.googleMapsLoaded = () => {
        console.log('Google Maps script loaded via callback function');
        
        // Wait a short time to ensure all objects are available
        setTimeout(() => {
          if (isGoogleMapsLoaded()) {
            console.log('Google Maps API objects confirmed available');
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
