
/**
 * Geocoder service for coordinate lookup
 * This service manages the Google Maps Geocoder instance
 */

/**
 * Returns a Google Maps Geocoder instance if Google Maps API is available
 * @returns Google Maps Geocoder or null if not available
 */
export const getGoogleGeocoder = (): google.maps.Geocoder | null => {
  if (typeof window === 'undefined') return null;
  
  // Check if Google Maps is loaded
  if (!window.google || !window.google.maps) {
    console.warn('⚠️ Google Maps not loaded, cannot create geocoder');
    return null;
  }
  
  try {
    return new google.maps.Geocoder();
  } catch (error) {
    console.error('❌ Error creating Google Geocoder:', error);
    return null;
  }
};
