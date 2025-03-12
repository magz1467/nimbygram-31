
import { searchLogger } from '@/utils/searchLogger';
import { SearchFilters } from "../use-planning-search";

/**
 * Logs search attempt for analytics and debugging
 */
export async function logSearchAttempt(
  coordinates: [number, number], 
  filters: SearchFilters,
  radiusKm: number
): Promise<void> {
  try {
    const [lat, lng] = coordinates;
    await searchLogger.logSearch(`${lat},${lng}`, 'coordinates', 'planning');
    
    console.log(`🔍 Search with coordinates: [${lat}, ${lng}], radius: ${radiusKm}km, filters:`, filters);
  } catch (error) {
    console.warn('Failed to log search attempt:', error);
    // Non-critical error, don't throw
  }
}
