/**
 * Utility for loading Google Maps script - optimized version
 */

// Use a single API key to prevent confusion
const GOOGLE_MAPS_API_KEY = 'AIzaSyC7zDNJTRJgs7g3E_MAAOv72cpZdp1APSA';

// Keep track of loading state to prevent duplicate loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Flag to prevent logging multiple times
let warningLogged = false;

/**
 * Check if Google Maps API is already available without waiting
 */
export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * Uses a singleton pattern to prevent duplicate loading
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  // Skip if window is not available (SSR)
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  
  // If already loaded, resolve immediately
  if (isGoogleMapsLoaded()) {
    isLoaded = true;
    return Promise.resolve();
  }
  
  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  // Check if script tag already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    if (!warningLogged) {
      console.warn('Google Maps script tag already exists, but API is not loaded yet. Waiting for it to load...');
      warningLogged = true;
    }
    
    // Return a promise that resolves when the API becomes available
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkInterval);
          isLoaded = true;
          resolve();
        }
      }, 100);
    });
  }
  
  // Create a new loading promise
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
      console.log('Loading Google Maps script...');
      
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define global callback function
      window.initGoogleMaps = () => {
        console.log('Google Maps script loaded successfully via callback');
        isLoaded = true;
        isLoading = false;
        resolve();
        // Clean up global callback
        delete window.initGoogleMaps;
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        isLoading = false;
        loadPromise = null;
        reject(new Error('Google Maps script failed to load'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up Google Maps script:', error);
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });
  
  return loadPromise;
};

// Add type definition for the callback
declare global {
  interface Window {
    initGoogleMaps?: () => void;
    google: any;
  }
}
