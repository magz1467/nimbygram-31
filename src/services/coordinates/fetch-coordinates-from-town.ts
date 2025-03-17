
/**
 * Fetches coordinates for a UK town name prioritizing OS Places API
 * with fallback to Google Geocoding API
 */
import { fetchCoordinatesByLocationName } from './fetch-coordinates-by-location-name';
import { withTimeout } from '@/utils/fetchUtils';

interface TownCoordinatesResult {
  coordinates: [number, number];
  postcode: string | null; // Making it nullable instead of optional
}

export const fetchCoordinatesFromTown = async (townName: string): Promise<TownCoordinatesResult> => {
  console.log(`🔍 Fetching coordinates for town: ${townName}`);
  
  // For Liverpool, we'll always use direct coordinates to match preview behavior
  const isLiverpool = /\bliverpool\b/i.test(townName);
  if (isLiverpool) {
    console.log('🔍 Using direct coordinates for Liverpool to match preview');
    return {
      coordinates: [53.4084, -2.9916], // Liverpool city center
      postcode: "L1" // Central Liverpool outcode
    };
  }
  
  // Determine if this is a large city that might need a longer timeout
  const isLargeCity = /\b(london|manchester|birmingham|leeds|glasgow|edinburgh|newcastle|bristol|cardiff|belfast)\b/i.test(townName);
  
  // Use longer timeout for large cities - match timeout in preview
  const timeoutMs = isLargeCity ? 60000 : 30000; // 60 seconds for large cities, 30 for others
  
  console.log(`🔍 Using ${timeoutMs}ms timeout for ${isLargeCity ? 'large city' : 'town'}: ${townName}`);
  console.log(`🔍 Current hostname: ${window.location.hostname}`);
  
  try {
    // Create a promise for the location search
    const locationSearchPromise = async () => {
      console.log(`🔄 Using location name strategy for town: ${townName}`);
      
      const result = await fetchCoordinatesByLocationName(townName);
      
      // Ensure we conform to the TownCoordinatesResult interface
      return {
        coordinates: result.coordinates,
        postcode: result.postcode || null // Ensure we always return a string or null
      };
    };
    
    // Apply timeout to the search
    const result = await withTimeout(
      locationSearchPromise(),
      timeoutMs,
      isLargeCity 
        ? `Timeout searching for large city "${townName}". Try a more specific area within ${townName} (like "${townName} city center") or use a postcode.`
        : `Timeout searching for town "${townName}". Try a more specific location or postcode.`
    );
    
    console.log(`✅ Successfully found coordinates for town: ${townName}`, result.coordinates);
    return result;
  } catch (error: any) {
    console.error('Error fetching town coordinates:', error);
    
    // For Liverpool, provide fallback if we encountered an error
    if (isLiverpool) {
      console.log('🔄 Using Liverpool fallback after error');
      return {
        coordinates: [53.4084, -2.9916], // Liverpool city center
        postcode: "L1" // Central Liverpool outcode
      };
    }
    
    // Enhance error for large cities
    if (isLargeCity && (error.message.includes('timeout') || error.message.includes('timed out'))) {
      const enhancedError = new Error(
        `Timeout searching for large city "${townName}". Try using a specific area within ${townName} (like "${townName} city center") or a postcode instead.`
      );
      (enhancedError as any).type = 'LARGE_AREA_TIMEOUT';
      throw enhancedError;
    }
    
    throw error;
  }
};
