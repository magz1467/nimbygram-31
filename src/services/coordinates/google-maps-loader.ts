/**
 * Utility for loading Google Maps script - consolidated version
 */

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
    return Promise.resolve();
  }
  
  // If there was a previous error, reject with the same error
  if (loadError) {
    console.warn('Previous Google Maps loading error:', loadError);
    return Promise.reject(loadError);
  }
  
  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  // Create a new loading promise
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Double-check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      isLoaded = true;
      isLoading = false;
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
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkIfLoaded, 100);
        }
      };
      
      setTimeout(checkIfLoaded, 100);
      return;
    }
    
    console.log('Loading Google Maps script...');
    
    // Create script element with explicit libraries
    const script = document.createElement('script');
    // Add all necessary libraries: places, geocoding, geometry
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding,geometry&v=quarterly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      
      // Verify the API key works by making a simple API call
      try {
        // Check if geocoding is available and works
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: 'London, UK' }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            console.log('Google Maps Geocoder API is working correctly');
            isLoaded = true;
            isLoading = false;
            loadError = null;
            resolve();
          } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED || 
                    status === google.maps.GeocoderStatus.ERROR) {
            const apiError = new Error(`Google Maps API key issue: ${status}`);
            console.error(apiError);
            loadError = apiError;
            isLoading = false;
            reject(apiError);
          } else {
            // Other statuses may be normal (e.g., ZERO_RESULTS)
            console.log('Geocoder test status:', status);
            isLoaded = true;
            isLoading = false;
            resolve();
          }
        });
      } catch (error) {
        console.error('Error testing Google Maps API:', error);
        loadError = error instanceof Error ? error : new Error(String(error));
        isLoading = false;
        reject(loadError);
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      loadError = new Error('Google Maps script failed to load');
      isLoading = false;
      loadPromise = null;
      reject(loadError);
    };
    
    document.head.appendChild(script);
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
