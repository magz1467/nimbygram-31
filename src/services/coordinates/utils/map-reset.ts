
/**
 * Map reset utility
 * Provides functions to clean up and reset Google Maps state
 */

// Define window interface extension
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
    google?: {
      maps?: any;
      // Add potential other Google services that might be present
      [key: string]: any;
    };
  }
}

// Known expired API key to check for specifically
const EXPIRED_API_KEY = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';

/**
 * Completely resets the Google Maps loader state
 * Removes script tags and cleans up Google objects
 * @param forceCleanup Whether to force a complete cleanup including the google object
 */
export const resetGoogleMaps = (forceCleanup = false): void => {
  console.log('Resetting Google Maps loader state');
  
  // Remove the callback function
  if (window.googleMapsLoaded) {
    delete window.googleMapsLoaded;
  }
  
  // Remove ANY existing Google Maps script tags
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  console.log(`Removing ${existingScripts.length} existing Google Maps script tags`);
  
  existingScripts.forEach(script => {
    try {
      // Type assertion to HTMLScriptElement to fix the TypeScript error
      const scriptElement = script as HTMLScriptElement;
      const src = scriptElement.src || '';
      
      // Aggressively remove scripts with expired keys
      if (src.includes(EXPIRED_API_KEY)) {
        console.log('🚨 Removing script with EXPIRED API key:', src);
        scriptElement.remove();
      } else {
        console.log('Removing script:', scriptElement.src);
        scriptElement.remove();
      }
    } catch (e) {
      console.warn('Error removing script:', e);
    }
  });
  
  // Clean up any Google objects that might be cached
  if (window.google) {
    try {
      // Clean up the google.maps object specifically
      if (window.google.maps) {
        console.log('Cleaning up existing Google Maps object');
        // Use delete with proper type handling
        delete window.google.maps;
      }
      
      // In extreme cases, remove the entire google object
      if (forceCleanup) {
        console.log('Forcing cleanup of entire google object');
        // Use delete with proper window typing
        delete window.google;
      }
    } catch (e) {
      console.warn('Could not clean up Google Maps object:', e);
    }
  }
  
  console.log('Google Maps loader has been reset');
};
