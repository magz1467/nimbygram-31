
import { performSpatialSearch } from './spatial-search';
import { performFallbackSearch } from './fallback-search';
import { SearchFilters } from './types';

/**
 * Performs a two-tier search strategy:
 * 1. Try spatial search first
 * 2. Fall back to bounding box search if spatial search fails
 * 
 * @param lat Latitude for the search
 * @param lng Longitude for the search
 * @param radius Search radius in kilometers
 * @param filters Optional search filters
 * @param limit Maximum number of results to return
 * @returns Array of application results with distance information
 */
export const executeSearchStrategy = async (
  lat: number,
  lng: number,
  radius: number,
  filters?: SearchFilters,
  limit: number = 25
): Promise<any[]> => {
  console.log('Executing search strategy at coordinates:', lat, lng, 'with radius:', radius);
  
  // First try spatial search (with PostGIS)
  try {
    console.log('Attempting spatial search first...');
    const spatialResults = await performSpatialSearch(lat, lng, radius, filters, limit);
    
    // If spatial search returns results or empty array (not null), use those results
    if (spatialResults !== null) {
      console.log('Using spatial search results:', spatialResults.length);
      return spatialResults;
    }
  } catch (error) {
    console.error('Spatial search failed:', error);
    // Continue to fallback search
  }
  
  // If spatial search returns null (indicating failure/unavailability), use fallback
  console.log('Spatial search unavailable, using fallback search');
  const fallbackResults = await performFallbackSearch(lat, lng, radius, filters, limit);
  console.log('Got fallback results:', fallbackResults.length);
  
  return fallbackResults;
};
