
/**
 * Map reset utility
 * Provides functions to clean up and reset Google Maps state
 */

// Define window interface extension
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
  }
}

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
      console.log('Removing script:', scriptElement.src);
      scriptElement.remove();
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
        // @ts-ignore - Force delete the google.maps object
        delete window.google.maps;
      }
      
      // In extreme cases, remove the entire google object
      if (forceCleanup) {
        console.log('Forcing cleanup of entire google object');
        // @ts-ignore - Force delete the google object
        delete window.google;
      }
    } catch (e) {
      console.warn('Could not clean up Google Maps object:', e);
    }
  }
  
  console.log('Google Maps loader has been reset');
};
