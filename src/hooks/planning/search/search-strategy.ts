
import { QueryClient } from '@tanstack/react-query';
import { performSpatialSearch } from './spatial-search-function';
import { performFallbackSearch } from './fallback-search-function';
import { SearchFilters } from './types';
import { isSearchQueryCached, createSearchQueryKey } from './search-cache-utils';
import { batchSearchLocations, getSearchRequestKey } from './batch-search';

const recentSearchCache: Record<string, any[]> = {};
const RECENT_CACHE_SIZE = 10;

let batchSearchQueue: Array<{
  coordinates: [number, number];
  radius: number;
  filters?: SearchFilters;
  resolve: (results: any[]) => void;
  reject: (error: any) => void;
}> = [];
let batchSearchTimeout: NodeJS.Timeout | null = null;
const BATCH_WINDOW_MS = 300;

const processBatchSearchQueue = async () => {
  if (!batchSearchQueue.length) return;
  
  const currentQueue = [...batchSearchQueue];
  batchSearchQueue = [];
  batchSearchTimeout = null;
  
  try {
    const batchResults = await batchSearchLocations(
      currentQueue.map(item => ({
        coordinates: item.coordinates,
        radius: item.radius,
        filters: item.filters
      }))
    );
    
    currentQueue.forEach(item => {
      const key = getSearchRequestKey(item.coordinates, item.radius, item.filters);
      const results = batchResults[key] || [];
      
      const cacheKey = createCacheKey(item.coordinates, item.radius, item.filters);
      recentSearchCache[cacheKey] = results;
      
      item.resolve(results);
    });
  } catch (error) {
    currentQueue.forEach(item => item.reject(error));
  }
};

const createCacheKey = (
  coordinates: [number, number],
  radius: number,
  filters?: SearchFilters
): string => {
  return `${coordinates[0]},${coordinates[1]},${radius},${JSON.stringify(filters || {})}`;
};

export const executeSearchStrategy = async (
  lat: number,
  lng: number,
  radius: number,
  filters?: SearchFilters,
  limit: number = 25
): Promise<any[]> => {
  console.log('Executing search strategy at coordinates:', lat, lng, 'with radius:', radius);
  
  const cacheKey = createCacheKey([lat, lng], radius, filters);
  
  if (recentSearchCache[cacheKey]) {
    console.log('Using cached results for', cacheKey);
    return recentSearchCache[cacheKey];
  }
  
  if (batchSearchQueue.length > 0) {
    console.log('Adding search to batch queue:', lat, lng, radius);
    
    return new Promise((resolve, reject) => {
      batchSearchQueue.push({
        coordinates: [lat, lng],
        radius,
        filters,
        resolve,
        reject
      });
      
      if (!batchSearchTimeout) {
        batchSearchTimeout = setTimeout(processBatchSearchQueue, BATCH_WINDOW_MS);
      }
    });
  }
  
  try {
    console.log('Attempting spatial search first...');
    const spatialResults = await performSpatialSearch(lat, lng, radius, filters, limit);
    
    if (spatialResults !== null) {
      console.log('Using spatial search results:', spatialResults.length);
      
      recentSearchCache[cacheKey] = spatialResults;
      
      const cacheKeys = Object.keys(recentSearchCache);
      if (cacheKeys.length > RECENT_CACHE_SIZE) {
        delete recentSearchCache[cacheKeys[0]];
      }
      
      return spatialResults;
    }
    
    // If spatial search returns null (function not available), use fallback
    console.log('Spatial search unavailable, using fallback search');
    const fallbackResults = await performFallbackSearch(lat, lng, radius, filters, limit);
    console.log('Got fallback results:', fallbackResults.length);
    
    recentSearchCache[cacheKey] = fallbackResults;
    
    const cacheKeys = Object.keys(recentSearchCache);
    if (cacheKeys.length > RECENT_CACHE_SIZE) {
      delete recentSearchCache[cacheKeys[0]];
    }
    
    return fallbackResults;
  } catch (error) {
    console.error('Spatial search failed:', error);
    console.log('Spatial search unavailable, using fallback search');
    const fallbackResults = await performFallbackSearch(lat, lng, radius, filters, limit);
    console.log('Got fallback results:', fallbackResults.length);
    
    recentSearchCache[cacheKey] = fallbackResults;
    
    const cacheKeys = Object.keys(recentSearchCache);
    if (cacheKeys.length > RECENT_CACHE_SIZE) {
      delete recentSearchCache[cacheKeys[0]];
    }
    
    return fallbackResults;
  }
};

export const clearSearchCache = (): void => {
  Object.keys(recentSearchCache).forEach(key => {
    delete recentSearchCache[key];
  });
};

export const prefetchLocationSearch = async (
  lat: number,
  lng: number,
  radius: number,
  filters?: SearchFilters
): Promise<void> => {
  const cacheKey = createCacheKey([lat, lng], radius, filters);
  
  if (recentSearchCache[cacheKey]) {
    return;
  }
  
  return new Promise((resolve, reject) => {
    batchSearchQueue.push({
      coordinates: [lat, lng],
      radius,
      filters,
      resolve: () => resolve(),
      reject
    });
    
    if (!batchSearchTimeout) {
      batchSearchTimeout = setTimeout(processBatchSearchQueue, BATCH_WINDOW_MS);
    }
  });
};
