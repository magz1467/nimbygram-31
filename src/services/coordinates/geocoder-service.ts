
/**
 * Geocoder service for coordinate lookup
 * This service manages the Google Maps Geocoder instance and includes debugging
 */

import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";

/**
 * Returns a Google Maps Geocoder instance if Google Maps API is available
 * @returns Google Maps Geocoder or null if not available
 */
export const getGoogleGeocoder = (): google.maps.Geocoder | null => {
  if (typeof window === 'undefined') return null;
  
  // Check if Google Maps is loaded
  if (!window.google || !window.google.maps) {
    console.warn('⚠️ Google Maps not loaded, cannot create geocoder');
    console.log('Current hostname:', getCurrentHostname());
    console.log('API key ending with:', getGoogleMapsApiKey().slice(-6));
    return null;
  }
  
  try {
    // Log successful geocoder creation for debugging
    console.log('✅ Creating Google Geocoder');
    console.log('Current hostname:', getCurrentHostname());
    console.log('Using API key ending with:', getGoogleMapsApiKey().slice(-6));
    return new google.maps.Geocoder();
  } catch (error) {
    console.error('❌ Error creating Google Geocoder:', error);
    console.error('Current hostname:', getCurrentHostname());
    console.error('API key ending with:', getGoogleMapsApiKey().slice(-6));
    return null;
  }
};

/**
 * Test geocoding functionality to verify API key is working
 * @returns Promise with test result
 */
export const testGeocoder = async (): Promise<{success: boolean, status?: string, error?: string}> => {
  try {
    console.log('🧪 Testing geocoder with API key ending:', getGoogleMapsApiKey().slice(-6));
    console.log('Current hostname:', getCurrentHostname());
    
    const geocoder = getGoogleGeocoder();
    if (!geocoder) {
      return {
        success: false,
        error: 'Geocoder not available - Maps API not loaded'
      };
    }
    
    return new Promise((resolve) => {
      geocoder.geocode({ address: 'London, UK' }, (results, status) => {
        console.log('🧪 Geocoder test result:', status);
        console.log('🧪 Found results:', results ? results.length : 0);
        
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          resolve({
            success: true,
            status: status
          });
        } else {
          resolve({
            success: false,
            status: status,
            error: `Geocoder failed with status: ${status}`
          });
        }
      });
    });
  } catch (error) {
    console.error('🧪 Error testing geocoder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
