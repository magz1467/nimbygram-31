
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Application } from "@/types/planning";
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import type { SearchFilters, SearchMethod } from './search/types';
import { useProgressiveSearch } from './search/progressive-search';
import { useSearchErrorHandler } from './search/use-search-error-handler';
import { useSearchTelemetry } from './search/use-search-telemetry';
import { executeSearch } from './search/search-executor';
import { useSearchStateManager } from './search/use-search-state-manager';
import { useDebounce } from '@/hooks/use-debounce';

export type { SearchFilters } from './search/types';

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  
  // Use our centralized search state manager
  const {
    state: searchState,
    startSearch,
    updateProgress,
    setSearchMethod,
    setResults,
    completeSearch,
    failSearch
  } = useSearchStateManager();
  
  const { logSearchCompleted } = useSearchTelemetry();
  const { handleSearchError } = useSearchErrorHandler(
    coordinates, 
    searchRadius, 
    filters
  );
  
  // Use progressive search for quick initial results
  const { results: progressiveResults, isLoading: isLoadingProgressive } = 
    useProgressiveSearch(coordinates, searchRadius, filters);
  
  const componentId = useRef(`search-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const queryStartTimeRef = useRef<number>(0);
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  // Track renders
  renderCountRef.current += 1;
  
  // Log mount information
  useEffect(() => {
    console.log(`🔎 usePlanningSearch [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      hasCoordinates: !!coordinates,
      coordinates: coordinates?.join(',') || 'none',
    });
    
    return () => {
      console.log(`🔎 usePlanningSearch [${componentId}] UNMOUNTED after ${renderCountRef.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
      });
    };
  }, [componentId, coordinates]);
  
  // Debounce coordinates changes to prevent rapid refetching
  const debouncedCoordinates = useDebounce(coordinates, 300);
  
  // Update query key when search parameters change
  useEffect(() => {
    if (!debouncedCoordinates) return;
    
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    const coordString = debouncedCoordinates.join(',');
    
    // Only update the query key if the search parameters have changed
    if (
      queryKey.current[1] !== coordString || 
      queryKey.current[2] !== filterString || 
      queryKey.current[3] !== radiusString
    ) {
      const oldKey = [...queryKey.current];
      queryKey.current = ['planning-applications', coordString, filterString, radiusString];
      console.log(`🔑 usePlanningSearch [${componentId}] query key changed`, {
        from: oldKey,
        to: queryKey.current,
        renderCount: renderCountRef.current
      });
      
      // Start search when parameters change
      startSearch();
    }
  }, [debouncedCoordinates, filters, searchRadius, componentId, startSearch]);
  
  // Execute the main search query
  const {
    data: applications = [],
    isFetching
  } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!debouncedCoordinates) return [];
      
      try {
        queryStartTimeRef.current = Date.now();
        console.log(`🔍 usePlanningSearch [${componentId}] query started`, {
          coordinates: debouncedCoordinates,
          radius: searchRadius,
          filters: Object.keys(filters),
          time: new Date().toISOString(),
          queryKey: queryKey.current,
        });
        
        updateProgress('coordinates', 10);
        
        const result = await executeSearch(
          { coordinates: debouncedCoordinates, radius: searchRadius, filters },
          {
            onProgress: updateProgress,
            onMethodChange: setSearchMethod
          }
        );
        
        // Process the results
        updateProgress('processing', 90);
        
        console.log(`✅ usePlanningSearch [${componentId}] query completed`, {
          method: result.method,
          resultCount: result.applications.length,
          duration: Date.now() - queryStartTimeRef.current,
          time: new Date().toISOString(),
        });
        
        // Log telemetry data about the search
        logSearchCompleted(
          debouncedCoordinates,
          searchRadius,
          filters,
          result.applications.length,
          result.method
        );
        
        // Update results in the search state manager
        setResults(result.applications);
        
        // Mark search as complete
        completeSearch();
        
        return result.applications;
      } catch (err) {
        console.error(`❌ usePlanningSearch [${componentId}] query error:`, err);
        handleSearchError(err);
        
        // Use progressive results as fallback if we have them
        const fallbackResults = progressiveResults.length > 0 ? progressiveResults : [];
        console.log(`⚠️ usePlanningSearch [${componentId}] using fallback results`, {
          count: fallbackResults.length,
          time: new Date().toISOString(),
        });
        
        // Update results with whatever we have
        setResults(fallbackResults);
        
        // Mark the search as failed
        failSearch(err instanceof Error ? err : new Error(String(err)));
        
        return fallbackResults;
      }
    },
    enabled: !!debouncedCoordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // When we get applications from the query, update our results
  useEffect(() => {
    if (applications && applications.length > 0) {
      setResults(applications);
    }
  }, [applications, setResults]);

  // Use progressive results while waiting for main search
  const finalApplications = (searchState.isLoading && progressiveResults.length > 0) 
    ? progressiveResults 
    : (applications || []);

  return {
    applications: finalApplications,
    hasResults: searchState.hasResults,
    isLoading: searchState.isLoading,
    isFetching,
    isLoadingProgressive,
    error: searchState.error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    searchState,
    progressiveResults: progressiveResults.length > 0
  };
};
