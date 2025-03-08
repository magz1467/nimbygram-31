
// Flag to track if the API has been loaded successfully
let googleMapsLoaded = false;
let loadAttempted = false;

/**
 * Loads the Google Maps script with the provided API key
 * @param apiKey The Google Maps API key
 * @returns Promise that resolves to true if the script loaded successfully, false otherwise
 */
export const loadGoogleMapsScript = (apiKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // If script is already loaded, resolve immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      googleMapsLoaded = true;
      resolve(true);
      return;
    }
    
    // If we've already tried to load and failed, don't try again
    if (loadAttempted && !googleMapsLoaded) {
      resolve(false);
      return;
    }
    
    loadAttempted = true;
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set a timeout to handle cases where the script takes too long to load
    const timeoutId = setTimeout(() => {
      console.error('Google Maps script load timed out');
      resolve(false);
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeoutId);
      googleMapsLoaded = true;
      resolve(true);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('Failed to load Google Maps script:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Resets the load attempted flag - useful for testing
 */
export const resetLoadAttempted = () => {
  loadAttempted = false;
};

/**
 * Checks if Google Maps API is loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return googleMapsLoaded;
};
