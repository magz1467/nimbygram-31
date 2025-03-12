
const GOOGLE_MAPS_API_KEY = 'AIzaSyD8z9V13my1XNP-_xIgYQ6jmvSY75ehYbI'; // This is a public key, can be exposed in client-side code

/**
 * Loads the Google Maps JavaScript API script with Places library
 * @returns Promise that resolves when the script is loaded
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps already loaded, resolving immediately');
      resolve();
      return;
    }

    console.log('Loading Google Maps script...');
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set up event handlers
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      reject(new Error('Failed to load Google Maps script'));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
};
