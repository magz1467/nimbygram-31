
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
  'broadstairs': { lat: 51.3603, lng: 1.4322 },  // Added explicit entry for Broadstairs
  'kent': { lat: 51.2787, lng: 0.5217 },
  'margate': { lat: 51.3891, lng: 1.3862 },
  'ramsgate': { lat: 51.3371, lng: 1.4098 }
};

/**
 * Gets fallback coordinates for a location
 * @param locationName Location to find coordinates for
 * @returns Coordinates object or London coordinates as default
 */
export const getFallbackCoordinates = (locationName: string): {lat: number, lng: number} => {
  if (!locationName) return { lat: 51.5074, lng: -0.1278 }; // Default to London
  
  // Handle Broadstairs/Kent specially
  if (locationName.toLowerCase().includes('broadstairs')) {
    console.log('✅ Using exact fallback coordinates for Broadstairs');
    return { lat: 51.3603, lng: 1.4322 };
  }
  
  // Clean up location name for matching
  const simpleName = locationName.split(',')[0].trim().toLowerCase();
  
  // Direct match
  if (commonUKLocations[simpleName]) {
    console.log('✅ Using exact fallback coordinates for:', simpleName);
    return commonUKLocations[simpleName];
  }
  
  // Try fuzzy matching
  for (const [key, coords] of Object.entries(commonUKLocations)) {
    if (simpleName.includes(key) || key.includes(simpleName)) {
      console.log('✅ Using fuzzy fallback match:', key, 'for:', simpleName);
      return coords;
    }
  }
  
  // For Kent-related searches
  if (locationName.toLowerCase().includes('kent')) {
    console.log('✅ Using Kent fallback coordinates');
    return { lat: 51.2787, lng: 0.5217 };
  }
  
  console.log('⚠️ No specific fallback coordinates found for:', locationName, '- using London');
  return { lat: 51.5074, lng: -0.1278 }; // Default to London
};

/**
 * Convert a lat/lng object to coordinate tuple
 * @param location Location object with lat/lng properties
 * @returns [latitude, longitude] tuple
 */
export const locationToCoordinates = (location: {lat: number, lng: number}): [number, number] => {
  return [location.lat, location.lng];
};
