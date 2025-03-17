
/**
 * API validation utility
 * Functions to check Google Maps API key and domain restrictions
 */

import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";
import { ensureGoogleMapsLoaded } from "../google-maps-loader";

/**
 * Checks if the Google Maps API key has correct domain restrictions
 * @returns Promise with validation result
 */
export const checkApiKeyDomainRestrictions = async () => {
  console.log('Checking API key domain restrictions...');
  
  try {
    // Ensure Google Maps is loaded
    await ensureGoogleMapsLoaded();
    
    // If we get here, the API key is working for this domain
    console.log('API key is valid for domain:', getCurrentHostname());
    const apiKey = getGoogleMapsApiKey();
    return {
      isValid: true,
      domain: getCurrentHostname(),
      apiKey: apiKey.substring(apiKey.length - 6) // Only show last 6 chars for security
    };
  } catch (error) {
    console.error('API key validation failed:', error);
    const apiKey = getGoogleMapsApiKey();
    return {
      isValid: false,
      domain: getCurrentHostname(),
      apiKey: apiKey.substring(apiKey.length - 6), // Only show last 6 chars for security
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Diagnoses Google Maps API key issues in detail
 * @returns Promise with detailed diagnostic information
 */
export const diagnoseApiKeyIssues = async () => {
  try {
    console.log('🔎 Diagnosing Google Maps API key issues...');
    console.log('🔎 Current hostname:', getCurrentHostname());
    const apiKey = getGoogleMapsApiKey();
    console.log('🔎 API key ends with:', apiKey.slice(-6));
    
    if (!window.google || !window.google.maps) {
      console.log('🔎 Google Maps not loaded yet, loading...');
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&v=quarterly`;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        document.head.appendChild(script);
      });
      
      console.log('🔎 Google Maps script loaded for diagnostic');
    }
    
    // Test Geocoding
    const geocoder = new google.maps.Geocoder();
    const geocodeResult = await new Promise<any>((resolve) => {
      geocoder.geocode({ address: 'London, UK' }, (results, status) => {
        resolve({ status, resultsCount: results ? results.length : 0 });
      });
    });
    
    console.log('🔎 Geocoding test:', geocodeResult);
    
    // Test Places
    let placesResult;
    if (window.google.maps.places) {
      const placesService = new google.maps.places.AutocompleteService();
      placesResult = await new Promise<any>((resolve) => {
        placesService.getPlacePredictions(
          { input: 'London', componentRestrictions: { country: 'uk' } },
          (predictions, status) => {
            resolve({ status, predictionsCount: predictions ? predictions.length : 0 });
          }
        );
      });
      
      console.log('🔎 Places API test:', placesResult);
    } else {
      console.log('🔎 Places API not available');
    }
    
    return {
      hostname: getCurrentHostname(),
      apiKeyLastSix: apiKey.slice(-6),
      geocoding: geocodeResult,
      places: placesResult,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🔎 Error diagnosing API key issues:', error);
    const apiKey = getGoogleMapsApiKey();
    return {
      hostname: getCurrentHostname(),
      apiKeyLastSix: apiKey.slice(-6),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Provides the Google Maps API key for debugging
 * Only exposes the last few characters for security
 */
export const getGoogleMapsApiKeyForDebugging = () => {
  const apiKey = getGoogleMapsApiKey();
  return apiKey.substring(apiKey.length - 6);
};
