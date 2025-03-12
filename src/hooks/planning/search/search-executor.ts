
import { searchCache } from '@/services/cache/search-cache';
import { performSpatialSearch } from './spatial-search';
import { performFallbackSearch } from './fallback-search';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { withRetry } from '@/utils/retry';
import { SearchParams, SearchResult, SearchFilters } from './types';
import { toast } from '@/components/ui/use-toast';

export async function executeSearch(
  options: SearchParams,
  searchMethodRef: React.MutableRefObject<'spatial' | 'fallback' | null>
): Promise<SearchResult> {
  if (!options.coordinates) {
    throw new Error('Cannot search without coordinates');
  }
  
  const [lat, lng] = options.coordinates;
  
  // Check for cached results first
  if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
    const cachedResults = searchCache.get(options.coordinates, options.radius, options.filters);
    if (cachedResults && cachedResults.length > 0) {
      console.log(`Using ${cachedResults.length} cached results`);
      return {
        applications: cachedResults,
        searchMethod: 'cache'
      };
    }
  }
  
  // Try spatial search with pagination
  if (featureFlags.isEnabled(FeatureFlags.USE_SPATIAL_SEARCH)) {
    console.log('Attempting paginated spatial search...');
    
    try {
      searchMethodRef.current = 'spatial';
      const results = await withRetry(
        () => performSpatialSearch(
          lat, 
          lng, 
          options.radius, 
          options.filters,
          0, // First page
          50  // Page size
        ),
        {
          retries: 2,
          delay: 1000,
          onRetry: (err, attempt) => {
            console.log(`Retrying spatial search (attempt ${attempt}/2)`, err);
            // If it's a timeout, try with a smaller radius
            if (err && (err.message?.includes('timeout') || err.message?.includes('canceling statement'))) {
              const reducedRadius = options.radius * (0.7 - (attempt * 0.2)); // Progressive reduction
              console.log(`Reducing search radius to ${reducedRadius}km`);
              options.radius = Math.max(reducedRadius, 1); // Keep minimum of 1km radius
            }
          }
        }
      );
      
      if (results && Array.isArray(results) && results.length > 0) {
        console.log(`Got ${results.length} spatial search results`);
        
        if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
          searchCache.set(options.coordinates, options.radius, options.filters, results);
        }
        
        return {
          applications: results,
          searchMethod: 'spatial'
        };
      } else {
        console.log('Spatial search returned no results, falling back');
      }
    } catch (err) {
      console.error('Spatial search failed:', err);
      // Continue to fallback
    }
  }
  
  // Fallback search
  console.log('Using fallback search');
  searchMethodRef.current = 'fallback';
  
  try {
    const fallbackResults = await withRetry(
      () => performFallbackSearch(lat, lng, options.radius, options.filters),
      {
        retries: 2,
        delay: 1000,
        onRetry: (err, attempt) => {
          console.log(`Retrying fallback search (attempt ${attempt}/2)`, err);
          // If it's a timeout, try with a smaller radius
          if (err && (err.message?.includes('timeout') || err.message?.includes('canceling statement'))) {
            const reducedRadius = options.radius * (0.5 - (attempt * 0.2)); // Progressive reduction
            console.log(`Reducing fallback search radius to ${reducedRadius}km`);
            options.radius = Math.max(reducedRadius, 0.5); // Minimum 0.5km radius
          }
        }
      }
    );
    
    if (fallbackResults && fallbackResults.length > 0) {
      console.log(`Got ${fallbackResults.length} fallback search results`);
      
      if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
        searchCache.set(options.coordinates, options.radius, options.filters, fallbackResults);
      }
      
      return {
        applications: fallbackResults,
        searchMethod: 'fallback'
      };
    } else {
      console.log('No results found in any search method');
      return {
        applications: [],
        searchMethod: 'fallback'
      };
    }
  } catch (error) {
    // Final error handling
    console.error('All search methods failed:', error);
    throw error;
  }
}
