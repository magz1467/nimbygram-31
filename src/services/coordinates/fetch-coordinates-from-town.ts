
/**
 * Fetches coordinates for a UK town name prioritizing OS Places API
 * with fallback to Google Geocoding API
 */
import { fetchCoordinatesByLocationName } from './fetch-coordinates-by-location-name';

interface TownCoordinatesResult {
  coordinates: [number, number];
  postcode: string | null;
}

export const fetchCoordinatesFromTown = async (townName: string): Promise<TownCoordinatesResult> => {
  console.log(`🔍 Fetching coordinates for town: ${townName}`);
  
  // For now, we'll just use the location name strategy since we don't have OS Places API set up yet
  // In a production app, you would implement the OS Places API call here first
  
  try {
    console.log(`🔄 Using location name strategy for town: ${townName}`);
    return await fetchCoordinatesByLocationName(townName);
  } catch (error) {
    console.error('Error fetching town coordinates:', error);
    throw error;
  }
};
