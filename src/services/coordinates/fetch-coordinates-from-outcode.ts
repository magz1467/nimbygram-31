
/**
 * Fetches coordinates from a UK outcode using postcodes.io
 */

interface OutcodeCoordinatesResult {
  coordinates: [number, number];
  postcode: string | null;
}

export const fetchCoordinatesFromOutcode = async (outcode: string): Promise<OutcodeCoordinatesResult> => {
  console.log(`🔍 Fetching coordinates for outcode: ${outcode}`);
  
  try {
    // Use the postcodes.io outcode endpoint
    const response = await fetch(`https://api.postcodes.io/outcodes/${outcode.toUpperCase().trim()}`);
    
    if (!response.ok) {
      console.error(`Error fetching outcode data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to get coordinates for outcode: ${outcode}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.result || !data.result.latitude || !data.result.longitude) {
      console.error('Invalid response from postcodes.io:', data);
      throw new Error(`No valid coordinates found for outcode: ${outcode}`);
    }
    
    console.log(`✅ Found coordinates for outcode ${outcode}:`, data.result);
    
    return {
      coordinates: [data.result.latitude, data.result.longitude],
      postcode: outcode // Just return the outcode as the "postcode"
    };
  } catch (error) {
    console.error('Error in fetchCoordinatesFromOutcode:', error);
    throw error;
  }
};
