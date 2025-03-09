
/**
 * Utilities for detecting location types from search terms
 */

/**
 * Detects if a string appears to be a Google Place ID
 */
export const isGooglePlaceId = (location: string): boolean => {
  // Place IDs have a specific format - they start with ChIJ, Eh, or sometimes other patterns
  // but they never have spaces and are usually quite long
  return (location.startsWith('ChIJ') || 
         location.startsWith('Eh') || 
         location.startsWith('place_id:')) && 
         !location.includes(' ');
};

/**
 * Detects if a string appears to be a location name (e.g. "London, UK")
 */
export const isLocationName = (location: string): boolean => {
  // Location names typically contain spaces, commas, and often end with country codes
  // Also look for names like "Wendover" which are simple place names
  return (location.includes(' ') || 
         location.includes(',') || 
         location.includes(' in ')) || 
         location.endsWith('UK') || 
         location.endsWith('England') ||
         /^[A-Za-z]+$/.test(location) || // Single word place name like "Wendover"
         location.match(/[A-Za-z]+ [A-Za-z]+/) !== null; // Contains words with spaces
};

/**
 * Detects if a string looks like a UK postcode
 */
export const isUKPostcode = (location: string): boolean => {
  // UK postcodes follow specific formats
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(location.trim());
};

/**
 * Gets the appropriate method to fetch coordinates based on the input string
 */
export const detectLocationType = (location: string): 'PLACE_ID' | 'LOCATION_NAME' | 'POSTCODE' => {
  console.log('🔍 Detecting location type for:', location);
  
  if (!location || typeof location !== 'string') {
    console.log('❌ Invalid location input');
    return 'POSTCODE'; // Default to postcode as fallback
  }
  
  // Check for Place ID first
  if (isGooglePlaceId(location)) {
    console.log('✅ Detected as Google Place ID');
    return 'PLACE_ID';
  } 
  
  // Check for UK postcode next
  if (isUKPostcode(location)) {
    console.log('✅ Detected as UK postcode');
    return 'POSTCODE';
  }
  
  // Assume it's a location name if it doesn't match other patterns
  console.log('✅ Detected as location name');
  return 'LOCATION_NAME';
};

/**
 * Extracts the main place name from a formatted location string
 * For example, "London, Greater London, UK" -> "London"
 */
export const extractPlaceName = (location: string): string => {
  if (!location || typeof location !== 'string') {
    return '';
  }
  
  // If it has commas, take the part before the first comma
  if (location.includes(',')) {
    return location.split(',')[0].trim();
  }
  
  // Otherwise return the whole string
  return location.trim();
};
