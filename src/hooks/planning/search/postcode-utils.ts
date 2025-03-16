
/**
 * Utility functions for handling postcodes in searches
 */

/**
 * Determines if a string is a UK outcode (first part of a postcode)
 * @param postcode The string to check
 * @returns boolean indicating if it's an outcode
 */
export const isOutcode = (postcode: string): boolean => {
  return /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i.test(postcode);
};

/**
 * Converts a postcode to coordinates via the postcodes.io API
 * @param postcode The postcode to convert
 * @returns Promise with the [lat, lng] coordinates
 */
export const postcodeToCoordinates = async (postcode: string): Promise<[number, number]> => {
  // Determine if it's a full postcode or just an outcode
  const isOutcodeFormat = isOutcode(postcode);
  const endpoint = isOutcodeFormat 
    ? `https://api.postcodes.io/outcodes/${postcode}`
    : `https://api.postcodes.io/postcodes/${postcode}`;
    
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (!data.result) {
    throw new Error(isOutcodeFormat ? 'Invalid outcode' : 'Invalid postcode');
  }
  
  return [data.result.latitude, data.result.longitude];
};
