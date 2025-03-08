
/**
 * Utilities for detecting location types from search terms
 */

/**
 * Detects if a string appears to be a Google Place ID
 */
export const isGooglePlaceId = (location: string): boolean => {
  return location.startsWith('ChIJ') || 
         location.startsWith('Eh') || 
         (location.length > 15 && !location.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i));
};

/**
 * Detects if a string appears to be a location name (e.g. "London, UK")
 */
export const isLocationName = (location: string): boolean => {
  return location.includes(',') && location.includes('UK');
};

/**
 * Gets the appropriate method to fetch coordinates based on the input string
 */
export const detectLocationType = (location: string): 'PLACE_ID' | 'LOCATION_NAME' | 'POSTCODE' => {
  if (isGooglePlaceId(location)) {
    return 'PLACE_ID';
  } else if (isLocationName(location)) {
    return 'LOCATION_NAME';
  } else {
    return 'POSTCODE';
  }
};

/**
 * Extracts the main place name from a formatted location string
 * For example, "London, Greater London, UK" -> "London"
 */
export const extractPlaceName = (location: string): string => {
  return location.split(',')[0].trim();
};
