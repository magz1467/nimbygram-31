
/**
 * Simple utilities for detecting location types
 */

// Check if input is a Google Place ID
export const isGooglePlaceId = (location: string): boolean => {
  return location.startsWith('ChIJ') && !location.includes(' ');
};

// Check if input is a location name
export const isLocationName = (location: string): boolean => {
  return location.includes(' ') || location.includes(',');
};

// Check if input is a UK postcode
export const isUKPostcode = (location: string): boolean => {
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(location.trim());
};

// Check if input looks like a street address or town
export const isAddressLike = (location: string): boolean => {
  // Check if it has words that typically appear in UK addresses
  const addressTerms = ['road', 'street', 'avenue', 'lane', 'drive', 'close', 'way', 'court', 'terrace', 'town', 'village'];
  const lowerLocation = location.toLowerCase();
  return addressTerms.some(term => lowerLocation.includes(term));
};

// Detect location type
export const detectLocationType = (location: string): 'PLACE_ID' | 'LOCATION_NAME' | 'POSTCODE' | 'ADDRESS' => {
  if (isGooglePlaceId(location)) {
    return 'PLACE_ID';
  } 
  
  if (isUKPostcode(location)) {
    return 'POSTCODE';
  }

  if (isAddressLike(location)) {
    return 'ADDRESS';
  }
  
  return 'LOCATION_NAME';
};

// Extract place name from location string
export const extractPlaceName = (location: string): string => {
  if (location.includes(',')) {
    return location.split(',')[0].trim();
  }
  
  return location.trim();
};
