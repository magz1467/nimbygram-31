
import { performSpatialSearch } from './spatial-search';
import { performFallbackSearch } from './fallback-search';
import { SearchFilters } from '../use-planning-search';
import { logSearchAttempt } from './search-logger';
import { Application } from '@/types/planning';

/**
 * Core search execution logic combining spatial and fallback strategies
 */
export async function executeSearch(
  coordinates: [number, number],
  searchRadius: number,
  filters: SearchFilters,
): Promise<Application[]> {
  // Start timing for performance tracking
  const startTime = Date.now();
  console.group('Planning Application Search');
  console.log(`Search started at: ${new Date(startTime).toISOString()}`);
  
  // Log the search attempt for analytics
  await logSearchAttempt(coordinates, filters, searchRadius);
  
  const [lat, lng] = coordinates;
  let radiusKm = searchRadius;
  
  // Try spatial search first with a longer timeout
  try {
    console.log('Attempting spatial search with PostGIS...');
    const spatialStartTime = Date.now();
    console.log(`Spatial search started at: ${new Date(spatialStartTime).toISOString()}`);
    
    const spatialResults = await performSpatialSearch(lat, lng, radiusKm, filters);
    
    const spatialEndTime = Date.now();
    console.log(`Spatial search took ${spatialEndTime - spatialStartTime}ms`);
    console.log(`Spatial search completed at: ${new Date(spatialEndTime).toISOString()}`);
    
    if (spatialResults && spatialResults.length > 0) {
      console.log('Spatial search results:', spatialResults.length);
      console.log('First result distance:', spatialResults[0].distance);
      console.log('Last result distance:', spatialResults[spatialResults.length - 1].distance);
      
      const endTime = Date.now();
      console.log(`Total search time: ${endTime - startTime}ms`);
      console.groupEnd();
      return spatialResults;
    }
    
    console.log('Spatial search returned no results, falling back to standard search');
  } catch (spatialFunctionError: any) {
    console.error('Spatial function error details:', {
      error: spatialFunctionError,
      message: spatialFunctionError.message,
      stack: spatialFunctionError.stack,
      name: spatialFunctionError.name,
      code: (spatialFunctionError as any).code || 'unknown'
    });
    console.log('Spatial function not available or failed, using fallback method');
    
    // If this was a timeout error, we should adjust our approach for the fallback
    if (spatialFunctionError.name === 'AbortError' || 
        spatialFunctionError.message?.toLowerCase().includes('timeout')) {
      console.log('Reducing search radius for fallback due to timeout');
      radiusKm = Math.max(2, radiusKm - 2); // Reduce radius but keep at least 2km
    }
  }
  
  // If spatial search fails or isn't available, fall back to manual search
  console.log('Using fallback bounding box search with radius:', radiusKm);
  const fallbackStartTime = Date.now();
  console.log(`Fallback search started at: ${new Date(fallbackStartTime).toISOString()}`);
  
  const fallbackResults = await performFallbackSearch(lat, lng, radiusKm, filters);
  
  const fallbackEndTime = Date.now();
  console.log(`Fallback search took ${fallbackEndTime - fallbackStartTime}ms`);
  
  const endTime = Date.now();
  console.log(`Total search time: ${endTime - startTime}ms`);
  console.groupEnd();
  
  return fallbackResults;
}
