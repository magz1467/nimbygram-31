
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

// Check if input is just an outcode (first part of postcode)
export const isUKOutcode = (location: string): boolean => {
  const outcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;
  return outcodeRegex.test(location.trim());
};

// Check if input looks like a street address or town
export const isAddressLike = (location: string): boolean => {
  // Check if it has words that typically appear in UK addresses
  const addressTerms = ['road', 'street', 'avenue', 'lane', 'drive', 'close', 'way', 'court', 'terrace', 'town', 'village'];
  const lowerLocation = location.toLowerCase();
  return addressTerms.some(term => lowerLocation.includes(term));
};

// Check if input looks like a UK town or city name
export const isTownOrCity = (location: string): boolean => {
  // Common UK town/city suffixes and patterns
  const townPatterns = [
    ' on ', ' upon ', ' under ', ' in ', ' by ', 
    'shire', 'ham', 'ton', 'bury', 'ford', 'mouth', 'wich', 'cester', 'field'
  ];
  
  // Known UK towns and cities that don't match patterns
  const commonTowns = [
    'london', 'manchester', 'birmingham', 'leeds', 'liverpool', 'bristol', 
    'cardiff', 'edinburgh', 'glasgow', 'belfast', 'oxford', 'cambridge',
    'york', 'bath', 'reading', 'brighton', 'milton keynes', 'norwich',
    'nottingham', 'sheffield', 'southampton', 'plymouth', 'exeter', 'chester',
    'leicester', 'coventry', 'hull', 'stoke', 'swansea', 'preston', 'derby',
    'bradford', 'wolverhampton', 'portsmouth', 'newcastle', 'sunderland',
    'luton', 'blackpool', 'bolton', 'bournemouth', 'poole', 'middlesbrough',
    'peterborough', 'slough', 'huddersfield', 'blackburn', 'oldham', 'burnley',
    'northampton', 'warrington', 'watford', 'ipswich', 'rotherham', 'stockport',
    'lincoln', 'gloucester', 'wigan', 'southend', 'colchester', 'cheltenham',
    'wendover', 'aylesbury', 'amersham', 'high wycombe', 'marlow', 'beaconsfield'
  ];
  
  const lowerLocation = location.toLowerCase();
  const words = lowerLocation.split(/[\s,]+/);
  
  // Check if any word is a common town name
  const isCommonTown = words.some(word => commonTowns.includes(word));
  
  // Check if the location contains any town pattern
  const hasTownPattern = townPatterns.some(pattern => lowerLocation.includes(pattern));
  
  return isCommonTown || hasTownPattern;
};

// Detect location type with more granularity
export const detectLocationType = (location: string): 'PLACE_ID' | 'LOCATION_NAME' | 'POSTCODE' | 'OUTCODE' | 'TOWN' | 'ADDRESS' => {
  if (isGooglePlaceId(location)) {
    return 'PLACE_ID';
  } 
  
  if (isUKPostcode(location)) {
    return 'POSTCODE';
  }
  
  if (isUKOutcode(location)) {
    return 'OUTCODE';
  }
  
  if (isTownOrCity(location)) {
    return 'TOWN';
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
