
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { searchCache } from '@/services/cache/search-cache';
import { Application } from "@/types/planning";
import { SearchFilters } from '../types';

export function checkCache(
  coordinates: [number, number],
  searchRadius: number,
  filters: SearchFilters
): Application[] | null {
  if (!featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE)) {
    return null;
  }
  
  const cachedResults = searchCache.get(coordinates, searchRadius, filters);
  
  if (cachedResults && cachedResults.length > 0) {
    console.log(`Using ${cachedResults.length} cached results for progressive search`);
    return cachedResults;
  }
  
  return null;
}
