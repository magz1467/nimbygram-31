
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchFilters } from './types';
import { useSearchStateManager } from './use-search-state-manager';
import { Application } from '@/types/planning';

/**
 * Hook to coordinate search queries and state based on coordinates changes
 */
export function useSearchCoordinator(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters
) {
  // Get search state management functions
  const {
    state: searchState,
    startSearch,
    updateProgress,
    setSearchMethod,
    setResults,
    completeSearch,
    failSearch
  } = useSearchStateManager();

  // Debounce coordinates changes to prevent rapid refetching
  const debouncedCoordinates = useDebounce(coordinates, 300);
  
  // Track query key and query start time
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  const queryStartTimeRef = useRef<number>(0);
  const componentId = useRef(`sc-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  
  // Track renders
  renderCountRef.current += 1;
  
  // Log mount information
  useEffect(() => {
    console.log(`🔎 useSearchCoordinator [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      hasCoordinates: !!coordinates,
      coordinates: coordinates?.join(',') || 'none',
    });
    
    return () => {
      console.log(`🔎 useSearchCoordinator [${componentId}] UNMOUNTED after ${renderCountRef.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
      });
    };
  }, [componentId, coordinates]);
  
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
      console.log(`🔑 useSearchCoordinator [${componentId}] query key changed`, {
        from: oldKey,
        to: queryKey.current,
        renderCount: renderCountRef.current
      });
      
      // Start search when parameters change
      startSearch();
    }
  }, [debouncedCoordinates, filters, searchRadius, componentId, startSearch]);

  return {
    debouncedCoordinates,
    queryKey: queryKey.current,
    searchState,
    updateProgress,
    setSearchMethod,
    setResults,
    completeSearch,
    failSearch,
    queryStartTimeRef
  };
}
