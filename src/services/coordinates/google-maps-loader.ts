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
    // Double-check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API already available in window object');
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
          console.log('Google Maps loaded via existing script tag');
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
    console.log('Current hostname:', window.location.hostname);
    console.log('Using API key that ends with:', GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6));
    
    // Create script element with explicit libraries
    const script = document.createElement('script');
    // Add all necessary libraries: places, geocoding, geometry
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding,geometry&v=quarterly&callback=googleMapsLoaded`;
    script.async = true;
    script.defer = true;
    
    // Add global callback function for script loading
    window.googleMapsLoaded = () => {
      console.log('Google Maps script loaded via callback function');
      // Note: we don't resolve here because we still need to verify API works
    };
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      
      // Verify the API key works by making a simple API call with longer timeout
      setTimeout(() => {
        try {
          // Check if geocoding is available and works
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: 'London, UK' }, (results, status) => {
            console.log('Geocoder test status:', status);
            console.log('Geocoder test results:', results ? results.length : 0);
            
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
              console.error('API key may be restricted to specific domains or has usage limits');
              console.error('Current hostname:', window.location.hostname);
              loadError = apiError;
              isLoading = false;
              reject(apiError);
            } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              const limitError = new Error('Google Maps API quota exceeded');
              console.error(limitError);
              console.error('The API key has reached its daily quota limit');
              loadError = limitError;
              isLoading = false;
              reject(limitError);
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
      }, 500); // Give the API a moment to initialize fully
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.error('Current hostname:', window.location.hostname);
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
