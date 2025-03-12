import { searchCache } from '@/services/cache/search-cache';
import { performSpatialSearch } from './spatial-search';
import { performFallbackSearch } from './fallback-search';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { withRetry } from '@/utils/retry';
import { SearchParams, SearchResult, SearchFilters } from './types';

export async function executeSearch(
  options: SearchParams,
  searchMethodRef: React.MutableRefObject<'spatial' | 'fallback' | null>
): Promise<SearchResult> {
  if (!options.coordinates) {
    throw new Error('Cannot search without coordinates');
  }
  
  const [lat, lng] = options.coordinates;
  
  // Try spatial search with pagination
  if (featureFlags.isEnabled(FeatureFlags.USE_SPATIAL_SEARCH)) {
    console.log('Attempting paginated spatial search...');
    
    try {
      searchMethodRef.current = 'spatial';
      const results = await performSpatialSearch(
        lat, 
        lng, 
        options.radius, 
        options.filters,
        0, // First page
        50  // Page size
      );
      
      if (results && Array.isArray(results)) {
        console.log(`Got ${results.length} initial results`);
        
        if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
          searchCache.set(options.coordinates, options.radius, options.filters, results);
        }
        
        return {
          applications: results,
          searchMethod: 'spatial'
        };
      }
    } catch (err) {
      console.error('Spatial search failed:', err);
      // Continue to fallback
    }
  }
  
  // Fallback search
  console.log('Using fallback search');
  searchMethodRef.current = 'fallback';
  
  const fallbackResults = await performFallbackSearch(lat, lng, options.radius, options.filters);
  
  if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
    searchCache.set(options.coordinates, options.radius, options.filters, fallbackResults);
  }
  
  return {
    applications: fallbackResults || [],
    searchMethod: 'fallback'
  };
}
