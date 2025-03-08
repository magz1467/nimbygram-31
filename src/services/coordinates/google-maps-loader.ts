
/**
 * Utility for loading Google Maps script
 */

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If script is already loaded, resolve immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }
    
    const apiKey = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      reject(new Error('Google Maps script failed to load'));
    };
    
    document.head.appendChild(script);
  });
};
