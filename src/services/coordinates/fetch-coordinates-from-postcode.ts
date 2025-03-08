
/**
 * Utility functions for fetching coordinates using UK postcodes
 */

/**
 * Fetches coordinates for a UK postcode using the Postcodes.io API
 * @param postcode The postcode to look up
 * @returns Promise with coordinates [lat, lng]
 */
export const fetchCoordinatesFromPostcodesIo = async (postcode: string): Promise<[number, number]> => {
  const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`);
  
  if (!response.ok) {
    throw new Error(`Postcode API returned ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('📍 Postcode API response:', data);
  
  if (data.status === 200 && data.result) {
    // Check explicitly for latitude and longitude
    if (typeof data.result.latitude === 'number' && typeof data.result.longitude === 'number') {
      const newCoordinates: [number, number] = [data.result.latitude, data.result.longitude];
      console.log('✅ Setting coordinates from postcode:', newCoordinates);
      return newCoordinates;
    } else {
      throw new Error("Invalid coordinates in postcode API response");
    }
  } else {
    throw new Error("Invalid response from postcode API");
  }
};
