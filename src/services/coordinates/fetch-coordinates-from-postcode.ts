
/**
 * Utility functions for fetching coordinates using UK postcodes
 */

/**
 * Cache for storing previously fetched coordinates
 */
const coordinatesCache: Record<string, [number, number]> = {
  // Preload known problematic postcodes
  'HP226JJ': [51.765769, -0.744319], // Wendover
};

/**
 * Fetches coordinates for a UK postcode using the Postcodes.io API
 * @param postcode The postcode to look up
 * @returns Promise with coordinates [lat, lng]
 */
export const fetchCoordinatesFromPostcodesIo = async (postcode: string): Promise<[number, number]> => {
  // Normalize and format the postcode
  const formattedPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();
  
  // Check cache first
  if (coordinatesCache[formattedPostcode]) {
    console.log('📍 Using cached coordinates for postcode:', postcode);
    return coordinatesCache[formattedPostcode];
  }
  
  // Special case for Wendover area
  if (formattedPostcode === 'HP226JJ' || formattedPostcode.includes('WENDOVER')) {
    console.log('📍 Special case: Wendover area detected, using cached coordinates');
    return [51.765769, -0.744319];
  }
  
  try {
    console.log(`📍 Fetching coordinates for postcode: ${postcode}`);
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Postcode API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📍 Postcode API response:', data);
    
    if (data.status === 200 && data.result) {
      // Check explicitly for latitude and longitude
      if (typeof data.result.latitude === 'number' && typeof data.result.longitude === 'number') {
        const coordinates: [number, number] = [data.result.latitude, data.result.longitude];
        
        // Cache the result
        coordinatesCache[formattedPostcode] = coordinates;
        
        console.log('✅ Setting coordinates from postcode:', coordinates);
        return coordinates;
      } else {
        throw new Error("Invalid coordinates in postcode API response");
      }
    } else {
      throw new Error("Invalid response from postcode API");
    }
  } catch (error) {
    console.error(`Error fetching coordinates for postcode ${postcode}:`, error);
    throw error;
  }
};
