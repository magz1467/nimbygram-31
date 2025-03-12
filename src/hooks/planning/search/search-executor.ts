
import { searchCache } from '@/services/cache/search-cache';
import { performSpatialSearch } from './spatial-search';
import { performFallbackSearch } from './fallback-search';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { withRetry } from '@/utils/retry';
import { SearchOptions, SearchResult, SearchFilters } from './types';

export async function executeSearch(
  options: SearchOptions,
  searchMethodRef: React.MutableRefObject<'spatial' | 'fallback' | null>
): Promise<SearchResult> {
  if (!options.coordinates) {
    throw new Error('Cannot search without coordinates');
  }
  
  const [lat, lng] = options.coordinates;
  
  // Try cache first
  if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
    const cachedResults = searchCache.get(options.coordinates, options.radius, options.filters);
    if (cachedResults) {
      console.log('Using cached results:', cachedResults.length);
      return {
        applications: cachedResults,
        searchMethod: 'cache'
      };
    }
  }
  
  // Try spatial search
  if (featureFlags.isEnabled(FeatureFlags.USE_SPATIAL_SEARCH)) {
    console.log('Attempting spatial search first...');
    
    const spatialSearchFn = async () => {
      searchMethodRef.current = 'spatial';
      return await performSpatialSearch(lat, lng, options.radius, options.filters);
    };
    
    let spatialResults = null;
    
    if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
      try {
        spatialResults = await withRetry(spatialSearchFn, {
          maxRetries: 2,
          retryableErrors: (err) => {
            const errMsg = err?.message?.toLowerCase() || '';
            return (
              errMsg.includes('network') ||
              errMsg.includes('timeout') ||
              errMsg.includes('too long')
            );
          },
          onRetry: (err, attempt, delay) => {
            console.log(`Retrying spatial search (attempt ${attempt}) in ${delay}ms`);
          }
        });
      } catch (err) {
        console.error('Spatial search failed after retries:', err);
        spatialResults = null;
      }
    } else {
      try {
        spatialResults = await performSpatialSearch(lat, lng, options.radius, options.filters);
      } catch (err) {
        console.error('Spatial search failed:', err);
        spatialResults = null;
      }
    }
    
    if (spatialResults !== null) {
      console.log('Using spatial search results:', spatialResults.length);
      
      if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
        searchCache.set(options.coordinates, options.radius, options.filters, spatialResults);
      }
      
      return {
        applications: spatialResults,
        searchMethod: 'spatial'
      };
    }
  }
  
  // Fallback search
  console.log('Spatial search unavailable, using fallback search');
  
  const fallbackSearchFn = async () => {
    searchMethodRef.current = 'fallback';
    return await performFallbackSearch(lat, lng, options.radius, options.filters);
  };
  
  let fallbackResults;
  
  if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
    fallbackResults = await withRetry(fallbackSearchFn, {
      maxRetries: 2,
      retryableErrors: (err) => {
        const errMsg = err?.message?.toLowerCase() || '';
        return (
          errMsg.includes('network') ||
          errMsg.includes('timeout') ||
          errMsg.includes('too long')
        );
      },
      onRetry: (err, attempt, delay) => {
        console.log(`Retrying fallback search (attempt ${attempt}) in ${delay}ms`);
      }
    });
  } else {
    fallbackResults = await fallbackSearchFn();
  }
  
  console.log('Got fallback results:', fallbackResults.length);
  
  if (featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
    searchCache.set(options.coordinates, options.radius, options.filters, fallbackResults);
  }
  
  return {
    applications: fallbackResults,
    searchMethod: 'fallback'
  };
}
