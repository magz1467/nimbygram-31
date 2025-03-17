
/**
 * Script cleanup utilities
 * Handles cleaning up Google Maps script tags and objects
 */

// Known expired API key to look for
const EXPIRED_API_KEY = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';

/**
 * Clean up any script tags with expired API keys
 */
export const cleanupExpiredKeyScripts = (): void => {
  if (typeof document === 'undefined') return;
  
  console.log('🧹 Checking for Google Maps scripts with expired keys...');
  const scripts = document.querySelectorAll('script');
  
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    // Specifically check for the known expired key
    if (src.includes('maps.googleapis.com') && src.includes(EXPIRED_API_KEY)) {
      console.log('🧹 Found and removing script with expired key:', src);
      script.parentNode?.removeChild(script);
      
      // Also clean up the Google Maps object to allow a fresh initialization
      if (window.google && window.google.maps) {
        console.log('🧹 Cleaning up expired Google Maps object');
        delete window.google.maps;
        
        // If no other Google APIs are in use, remove the entire google object
        const googleObj = window.google;
        let hasOtherApis = false;
        
        for (const key in googleObj) {
          if (key !== 'maps' && Object.prototype.hasOwnProperty.call(googleObj, key)) {
            hasOtherApis = true;
            break;
          }
        }
        
        if (!hasOtherApis) {
          console.log('🧹 No other Google APIs in use, removing google object');
          delete window.google;
        }
      }
    }
  });
};
