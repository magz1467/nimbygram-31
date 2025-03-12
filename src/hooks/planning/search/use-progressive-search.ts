
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { searchCache } from '@/services/cache/search-cache';
import { performFallbackSearch } from './fallback-search';
import { SearchFilters, ProgressiveSearchState } from './types';

export function useProgressiveSearch(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters
): ProgressiveSearchState {
  const [progressiveResults, setProgressiveResults] = useState<Application[]>([]);
  const [isLoadingProgressive, setIsLoadingProgressive] = useState<boolean>(false);
  
  useEffect(() => {
    if (!coordinates || !featureFlags.isEnabled(FeatureFlags.ENABLE_PROGRESSIVE_LOADING)) {
      return;
    }
    
    const cachedResults = featureFlags.isEnabled(FeatureFlags.USE_SEARCH_CACHE) ? 
      searchCache.get(coordinates, searchRadius, filters) : null;
    
    if (cachedResults && cachedResults.length > 0) {
      setProgressiveResults(cachedResults);
    } else {
      const quickSearchRadius = Math.max(1, Math.floor(searchRadius / 2));
      setIsLoadingProgressive(true);
      
      const performQuickSearch = async () => {
        try {
          const [lat, lng] = coordinates;
          
          const quickResults = await performFallbackSearch(lat, lng, quickSearchRadius, filters);
          
          if (quickResults.length > 0) {
            setProgressiveResults(quickResults);
          }
        } catch (err) {
          console.error('Quick search error:', err);
        } finally {
          setIsLoadingProgressive(false);
        }
      };
      
      performQuickSearch();
    }
  }, [coordinates, searchRadius, filters]);
  
  return {
    results: progressiveResults,
    isLoading: isLoadingProgressive
  };
}
