
/**
 * Fallback coordinates utility
 * Provides a fallback mechanism that doesn't rely on Google Maps
 */

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

/**
 * Finds fallback coordinates for a location when Google Maps is unavailable
 * @param location The location name to find coordinates for
 * @returns Coordinates as [latitude, longitude] or null if no match found
 */
export const getFallbackCoordinates = (location: string): [number, number] | null => {
  console.log('🔍 Attempting to find fallback coordinates for:', location);
  
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
 * All known fallback locations
 * @returns Array of location names that have fallback coordinates
 */
export const getFallbackLocations = (): string[] => {
  return Object.keys(UK_LOCATIONS);
};
