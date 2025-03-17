
/**
 * UK location fallbacks
 * Provides coordinates for common UK locations when API calls fail
 */

// Map of common UK locations with their coordinates
export const commonUKLocations: Record<string, {lat: number, lng: number}> = {
  'liverpool': { lat: 53.4084, lng: -2.9916 },
  'amersham': { lat: 51.6742, lng: -0.6077 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
  'edinburgh': { lat: 55.9533, lng: -3.1883 },
  'glasgow': { lat: 55.8642, lng: -4.2518 },
  'bristol': { lat: 51.4545, lng: -2.5879 },
  'cardiff': { lat: 51.4816, lng: -3.1791 },
  'belfast': { lat: 54.5973, lng: -5.9301 },
  'newcastle': { lat: 54.9783, lng: -1.6178 },
  'sheffield': { lat: 53.3811, lng: -1.4701 },
  'brighton': { lat: 50.8225, lng: -0.1372 },
  'nottingham': { lat: 52.9548, lng: -1.1581 },
  'leeds': { lat: 53.8008, lng: -1.5491 },
  'york': { lat: 53.9600, lng: -1.0873 },
  'cambridge': { lat: 52.2053, lng: 0.1218 },
  'oxford': { lat: 51.7520, lng: -1.2577 },
  'bath': { lat: 51.3837, lng: -2.3599 },
  'buckinghamshire': { lat: 51.8144, lng: -0.8093 },
  'broadstairs': { lat: 51.3603, lng: 1.4322 },
  'kent': { lat: 51.2787, lng: 0.5217 },
  'margate': { lat: 51.3891, lng: 1.3862 },
  'ramsgate': { lat: 51.3371, lng: 1.4098 },
  'coventry': { lat: 52.4068, lng: -1.5197 },
  'warwickshire': { lat: 52.2823, lng: -1.5854 }
};

/**
 * Gets fallback coordinates for a location - SIMPLIFIED VERSION
 * This version simply returns what is passed in if valid, or UK center as last resort
 * @param locationName Location to find coordinates for
 * @returns Coordinates object
 */
export const getFallbackCoordinates = (locationName: string): {lat: number, lng: number} => {
  if (!locationName) {
    // Central UK as absolute last resort
    return { lat: 54.0000, lng: -2.5000 };
  }
  
  // Look up location in our database
  for (const [key, coords] of Object.entries(commonUKLocations)) {
    if (locationName.toLowerCase().includes(key.toLowerCase())) {
      console.log('Using known coordinates for:', key);
      return coords;
    }
  }
  
  // Central UK as absolute last resort
  return { lat: 54.0000, lng: -2.5000 };
};

/**
 * Convert a lat/lng object to coordinate tuple
 * @param location Location object with lat/lng properties
 * @returns [latitude, longitude] tuple
 */
export const locationToCoordinates = (location: {lat: number, lng: number}): [number, number] => {
  return [location.lat, location.lng];
};
