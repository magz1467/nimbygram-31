/**
 * Utility for loading Google Maps script - consolidated version
 */

// Extend Window interface to include our custom property
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
  }
}

// Use a single API key to prevent confusion
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

// Keep track of loading state to prevent duplicate loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * Uses a singleton pattern to prevent duplicate loading
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps) {
    console.log('Google Maps already loaded, reusing existing instance');
    return Promise.resolve();
  }
  
  // If there was a previous error, reject with the same error
  if (loadError) {
    console.warn('Previous Google Maps loading error:', loadError);
    return Promise.reject(loadError);
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
      // Double-check if script is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps API already available in window object');
        isLoaded = true;
        isLoading = false;
        loadError = null;
        resolve();
        return;
      }
      
      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script tag already exists, waiting for it to load');
        
        // Wait for existing script to load
        const checkIfLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps loaded via existing script tag');
            isLoaded = true;
            isLoading = false;
            loadError = null;
            resolve();
          } else {
            setTimeout(checkIfLoaded, 100);
          }
        };
        
        setTimeout(checkIfLoaded, 100);
        return;
      }
      
      console.log('Loading Google Maps script...');
      console.log('Current hostname:', window.location.hostname);
      console.log('Using API key that ends with:', GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6));
      
      // Create script element with explicit libraries
      const script = document.createElement('script');
      // Add all necessary libraries: places, geocoding, geometry
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding,geometry&v=quarterly&callback=googleMapsLoaded`;
      script.async = true;
      script.defer = true;
      
      // Create a promise that will resolve with the script load event
      window.googleMapsLoaded = () => {
        console.log('Google Maps script loaded via callback function');
        
        // Wait a short time to ensure all objects are available
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps API objects confirmed available');
            isLoaded = true;
            isLoading = false;
            loadError = null;
            resolve();
          } else {
            const err = new Error('Google Maps objects not available after script loaded');
            console.error(err);
            loadError = err;
            isLoading = false;
            reject(err);
          }
        }, 300);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        console.error('Current hostname:', window.location.hostname);
        const err = new Error('Google Maps script failed to load');
        loadError = err;
        isLoading = false;
        loadPromise = null;
        reject(err);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Unexpected error loading Google Maps:', error);
      loadError = error instanceof Error ? error : new Error(String(error));
      isLoading = false;
      loadPromise = null;
      reject(loadError);
    }
  });
  
  return loadPromise;
};

// Function to reset the loader state for testing or recovery
export const resetGoogleMapsLoader = () => {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
  loadError = null;
  console.log('Google Maps loader has been reset');
};

// Function to check API key domain restrictions
export const checkApiKeyDomainRestrictions = async () => {
  console.log('Checking API key domain restrictions...');
  
  try {
    await ensureGoogleMapsLoaded();
    
    // If we get here, the API key is working for this domain
    console.log('API key is valid for domain:', window.location.hostname);
    return {
      isValid: true,
      domain: window.location.hostname
    };
  } catch (error) {
    console.error('API key validation failed:', error);
    return {
      isValid: false,
      domain: window.location.hostname,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Export for debugging
export const getGoogleMapsApiKey = () => GOOGLE_MAPS_API_KEY;
