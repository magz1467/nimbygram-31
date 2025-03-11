
import { ensureGoogleMapsLoaded } from '@/services/coordinates/google-maps-loader';

/**
 * Loads the Google Maps JavaScript API script with Places library
 * @returns Promise that resolves when the script is loaded
 */
export const loadGoogleMapsScript = ensureGoogleMapsLoaded;
