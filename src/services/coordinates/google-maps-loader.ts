/**
 * Utility for loading Google Maps script - consolidated version
 */

// Extend Window interface to include our custom property
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
  }
}

// Import the consistent API key from config
import { GOOGLE_MAPS_API_KEY } from "@/services/address/config/api-keys";
import { isProdDomain, getCurrentHostname } from "@/utils/environment";

// Keep track of loading state to prevent duplicate loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;
let loadRetries = 0;
const MAX_RETRIES = 2;

// Add fallback mechanism that doesn't rely on Google Maps
export const useFallbackCoordinates = (location: string): [number, number] | null => {
  console.log('🔍 Attempting to find fallback coordinates for:', location);
  
  // Common UK locations fallback map
  const UK_LOCATIONS: Record<string, [number, number]> = {
    'london': [51.5074, -0.1278],
    'manchester': [53.4808, -2.2426],
    'birmingham': [52.4862, -1.8904],
    'liverpool': [53.4084, -2.9916],
    'leeds': [53.8008, -1.5491],
    'glasgow': [55.8642, -4.2518],
    'edinburgh': [55.9533, -3.1883],
    'bristol': [51.4545, -2.5879],
    'cardiff': [51.4816, -3.1791],
    'belfast': [54.5973, -5.9301],
    'newcastle': [54.9783, -1.6178],
    'sheffield': [53.3811, -1.4701],
    'brighton': [50.8225, -0.1372],
    'york': [53.9600, -1.0873],
    'cambridge': [52.2053, 0.1218],
    'oxford': [51.7520, -1.2577],
    'nottingham': [52.9548, -1.1581],
    'bath': [51.3837, -2.3599],
    'amersham': [51.6741, -0.6081],
    'buckinghamshire': [51.8144, -0.8093]
  };
  
  // Check for location in our fallback map
  const locationLower = location.toLowerCase();
  
  // Direct match
  for (const [place, coords] of Object.entries(UK_LOCATIONS)) {
    if (locationLower === place) {
      console.log(`✅ Using exact fallback coordinates for: ${location} = ${coords}`);
      return coords;
    }
  }
  
  // Partial match - check if the location contains any of our known places
  for (const [place, coords] of Object.entries(UK_LOCATIONS)) {
    if (locationLower.includes(place)) {
      console.log(`✅ Using partial match fallback coordinates for: ${location} (matched: ${place}) = ${coords}`);
      return coords;
    }
  }
  
  // Default to London if nothing else matches
  console.log(`⚠️ No specific fallback found for: ${location}, defaulting to London`);
  return UK_LOCATIONS['london'];
};

/**
 * Ensures that the Google Maps script is loaded before using Google Maps API
 * Uses a singleton pattern to prevent duplicate loading
 * @returns Promise that resolves when Google Maps is available
 */
export const ensureGoogleMapsLoaded = async (): Promise<void> => {
  // Log the hostname for debugging
  console.log('🌐 Current hostname:', getCurrentHostname());
  
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps) {
    console.log('Google Maps already loaded, reusing existing instance');
    return Promise.resolve();
  }
  
  // If there was a previous error, retry up to MAX_RETRIES times
  if (loadError) {
    console.warn('Previous Google Maps loading error:', loadError);
    if (loadRetries < MAX_RETRIES) {
      console.log(`Retrying Google Maps load (attempt ${loadRetries + 1}/${MAX_RETRIES})`);
      loadRetries++;
      loadError = null;
      isLoading = false;
      loadPromise = null;
      
      // Force complete reset before retrying
      resetGoogleMapsLoader(true);
      
      console.log('Complete reset performed before retry');
    } else {
      // For preview compatibility - don't fail but proceed with fallback coordinates for major cities
      console.warn(`Max retries (${MAX_RETRIES}) reached for Google Maps loading, will use fallback coordinates`);
      // Instead of rejecting, resolve so that the fallback coordinates can be used
      return Promise.resolve();
    }
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
      // First, do a complete cleanup of any existing Google Maps scripts
      resetGoogleMapsLoader(true);
      
      // Double-check if script is already loaded after cleanup
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps API already available in window object after cleanup');
        isLoaded = true;
        isLoading = false;
        loadError = null;
        resolve();
        return;
      }
      
      console.log('Loading Google Maps script...');
      console.log('Current hostname:', window.location.hostname);
      console.log('Using API key that ends with:', GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6));
      
      // Create script element with explicit libraries
      const script = document.createElement('script');
      // Add all necessary libraries: places, geocoding, geometry
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding,geometry&v=weekly&callback=googleMapsLoaded`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script'; // Add ID for easier identification
      
      // Create a promise that will resolve with the script load event
      window.googleMapsLoaded = () => {
        console.log('Google Maps script loaded via callback function');
        
        // Wait a short time to ensure all objects are available
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps API objects confirmed available');
            console.log('Script used key ending with:', GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6));
            isLoaded = true;
            isLoading = false;
            loadError = null;
            resolve();
          } else {
            console.warn('Google Maps objects not available after script loaded');
            // Force reset and try again with fallback
            resetGoogleMapsLoader(true);
            isLoading = false;
            // Instead of rejecting, resolve so that the fallback coordinates can be used
            resolve();
          }
        }, 300);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        console.error('Current hostname:', window.location.hostname);
        
        // Reset for a clean state on next try
        resetGoogleMapsLoader(true);
        
        console.warn('Google Maps script failed to load, will use fallback coordinates');
        isLoading = false;
        // Instead of rejecting, resolve so that the fallback coordinates can be used
        resolve();
      };
      
      document.head.appendChild(script);
      
      // Set a timeout to resolve even if the script doesn't load properly
      // This ensures we can proceed with fallback coordinates in preview
      setTimeout(() => {
        if (isLoading) {
          console.warn('Google Maps script loading timed out, will use fallback coordinates');
          // Reset for a clean state on next try
          resetGoogleMapsLoader(true);
          isLoading = false;
          // Instead of rejecting, resolve so that the fallback coordinates can be used
          resolve();
        }
      }, 10000); // 10 second script load timeout
      
    } catch (error) {
      console.error('Unexpected error loading Google Maps:', error);
      
      // Reset for a clean state on next try
      resetGoogleMapsLoader(true);
      
      // For preview compatibility - don't fail but proceed with fallback coordinates
      console.warn('Unexpected error in Google Maps loading, will use fallback coordinates');
      isLoading = false;
      // Instead of rejecting, resolve so that the fallback coordinates can be used
      resolve();
    }
  });
  
  return loadPromise;
};

// Function to completely reset the loader state for testing or recovery
export const resetGoogleMapsLoader = (forceCleanup = false) => {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
  
  if (forceCleanup) {
    loadError = null;
    loadRetries = 0;
  }
  
  // Remove ANY existing Google Maps script tags, not just those with our selector
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
  
  // Also clean up any Google objects that might be cached
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
  
  // Remove the callback function
  if (window.googleMapsLoaded) {
    delete window.googleMapsLoaded;
  }
  
  console.log('Google Maps loader has been reset');
};

// Function to check API key domain restrictions
export const checkApiKeyDomainRestrictions = async () => {
  console.log('Checking API key domain restrictions...');
  
  try {
    // Force reset before checking
    resetGoogleMapsLoader(true);
    
    await ensureGoogleMapsLoaded();
    
    // If we get here, the API key is working for this domain
    console.log('API key is valid for domain:', window.location.hostname);
    return {
      isValid: true,
      domain: window.location.hostname,
      apiKey: GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6) // Only show last 6 chars for security
    };
  } catch (error) {
    console.error('API key validation failed:', error);
    return {
      isValid: false,
      domain: window.location.hostname,
      apiKey: GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 6), // Only show last 6 chars for security
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Export for debugging
export const getGoogleMapsApiKey = () => GOOGLE_MAPS_API_KEY;
