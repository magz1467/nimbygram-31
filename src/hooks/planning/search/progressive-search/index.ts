
import { useState, useEffect } from 'react';
import { ProgressiveSearchState, ProgressiveSearchOptions } from './types';
import { checkCache } from './cache-handler';
import { performQuickSearch } from './quick-search';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { SearchFilters } from '../types';

/**
 * Hook for progressive loading of search results
 * This provides quicker initial results while the main search is in progress
 */
export function useProgressiveSearch(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters,
  options: ProgressiveSearchOptions = {}
): ProgressiveSearchState {
  const [progressiveResults, setProgressiveResults] = useState<any[]>([]);
  const [isLoadingProgressive, setIsLoadingProgressive] = useState<boolean>(false);
  
  const {
    useCache = true,
    quickSearchRadiusFactor = 0.5
  } = options;
  
  useEffect(() => {
    // Reset state when coordinates change
    setProgressiveResults([]);
    
    if (!coordinates || !featureFlags.isEnabled(FeatureFlags.ENABLE_PROGRESSIVE_LOADING)) {
      return;
    }
    
    let isMounted = true;
    
    const loadProgressiveResults = async () => {
      // First check the cache if enabled
      if (useCache) {
        const cachedResults = checkCache(coordinates, searchRadius, filters);
        if (cachedResults && cachedResults.length > 0 && isMounted) {
          setProgressiveResults(cachedResults);
          return;
        }
      }
      
      // If no cached results, perform a quick search
      setIsLoadingProgressive(true);
      
      try {
        const results = await performQuickSearch(
          { coordinates, searchRadius, filters },
          quickSearchRadiusFactor
        );
        
        if (isMounted && results.length > 0) {
          setProgressiveResults(results);
        }
      } catch (error) {
        console.error('Progressive search error:', error);
      } finally {
        if (isMounted) {
          setIsLoadingProgressive(false);
        }
      }
    };
    
    loadProgressiveResults();
    
    // Cleanup function to reset results and handle component unmount
    return () => {
      isMounted = false;
      setProgressiveResults([]);
    };
  }, [coordinates, searchRadius, filters, useCache, quickSearchRadiusFactor]);
  
  return {
    results: progressiveResults,
    isLoading: isLoadingProgressive
  };
}
