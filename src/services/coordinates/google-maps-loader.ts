/**
 * Utility for loading Google Maps script - consolidated version
 */

// Use a single API key to prevent confusion
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';

// Keep track of loading state to prevent duplicate loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

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
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      isLoaded = true;
      isLoading = false;
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      isLoading = false;
      loadPromise = null;
      reject(new Error('Google Maps script failed to load'));
    };
    
    document.head.appendChild(script);
  });
  
  return loadPromise;
};
