
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchFilters } from './types';
import { useSearchStateManager } from './use-search-state-manager';
import { Application } from '@/types/planning';

export function useSearchCoordinator(
  coordinates: [number, number] | null,
  filters: SearchFilters
) {
  const {
    isLoading,
    stage,
    progress,
    error,
    method,
    results,
    hasResults,
    startSearch,
    _updateProgress: updateProgress,
    _updateMethod: updateMethod
  } = useSearchStateManager();

  // Debounce coordinates changes to prevent rapid refetching
  const debouncedCoordinates = useDebounce(coordinates, 300);
  
  // Track query key and query start time
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  const queryStartTimeRef = useRef<number>(Date.now());
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
    const coordString = debouncedCoordinates.join(',');
    
    if (queryKey.current[1] !== coordString || queryKey.current[2] !== filterString) {
      const oldKey = [...queryKey.current];
      queryKey.current = ['planning-applications', coordString, filterString];
      console.log(`🔑 useSearchCoordinator [${componentId}] query key changed`, {
        from: oldKey,
        to: queryKey.current,
        renderCount: renderCountRef.current
      });
      
      startSearch({
        coordinates: debouncedCoordinates,
        filters,
        radius: 5 // Fixed 5km radius as per requirements
      });
    }
  }, [debouncedCoordinates, filters, componentId, startSearch]);

  return {
    debouncedCoordinates,
    queryKey: queryKey.current,
    isLoading,
    stage,
    progress,
    error,
    method,
    results,
    hasResults,
    updateProgress,
    updateMethod,
    queryStartTimeRef
  };
}
