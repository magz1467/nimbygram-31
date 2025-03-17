
/**
 * Fallback loader utilities
 * Provides fallback coordinates when Google Maps fails to load
 */

import { getFallbackCoordinates } from '@/utils/location-fallbacks';

/**
 * Extend Window interface to include our custom property
 */
declare global {
  interface Window {
    googleMapsLoaded?: () => void;
    google?: {
      maps?: any;
      [key: string]: any;
    };
  }
}

/**
 * Provides fallback coordinates for location names
 * @param locationName Location to find coordinates for
 * @returns Coordinates tuple or null
 */
export const useFallbackCoordinates = (locationName: string): [number, number] | null => {
  const fallbackLocation = getFallbackCoordinates(locationName);
  return fallbackLocation ? [fallbackLocation.lat, fallbackLocation.lng] : null;
};

/**
 * Checks if Google Maps is already available
 * @returns True if Google Maps is loaded and available
 */
export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};
