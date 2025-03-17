
/**
 * Utilities for location name geocoding
 */

import { getGoogleMapsApiKey } from "@/utils/api-keys";
import { getCurrentHostname } from "@/utils/environment";

/**
 * Logs debugging information for geocoding operations
 * @param locationName The location being searched
 */
export const logGeocodeDebugInfo = (locationName: string): void => {
  console.log('🔍 Fetching coordinates for location name:', locationName);
  console.log('🔍 Current hostname:', getCurrentHostname());
  console.log('🔍 Using API key ending with:', getGoogleMapsApiKey().slice(-6));
};

/**
 * Logs error information for geocoding failures
 * @param error The error that occurred
 */
export const logGeocodeError = (error: unknown): void => {
  console.error('❌ Error fetching coordinates by location name:', error);
  console.error('❌ Current hostname:', getCurrentHostname());
  console.error('❌ API key used (last 6 chars):', getGoogleMapsApiKey().slice(-6));
};
