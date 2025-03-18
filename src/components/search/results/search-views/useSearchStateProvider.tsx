
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLoadingState } from '@/hooks/use-loading-state';
import { useCoordinates } from '@/hooks/use-coordinates';
import { usePlanningSearch } from '@/hooks/planning/use-planning-search';
import { handleError } from '@/utils/errors/centralized-handler';
import { getSearchPerformanceTracker } from '@/utils/performance/search-performance-tracker';
import { ErrorType, createAppError } from '@/utils/errors/types';

export function useSearchStateProvider(initialSearch?: {
  searchType: 'postcode' | 'location';
  searchTerm: string;
  displayTerm?: string;
  timestamp?: number;
}) {
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const searchInitiatedRef = useRef(false);
  
  // Track if this is a fresh search vs a component remount
  const searchTimestampRef = useRef<number | null>(null);
  
  // Debug info
  console.log('[useSearchStateProvider] Initializing with search:', 
    initialSearch ? { term: initialSearch.searchTerm, timestamp: initialSearch.timestamp } : 'none');
  
  const performanceTracker = useMemo(() => 
    getSearchPerformanceTracker(`search-${initialSearch?.timestamp || Date.now()}`),
    [initialSearch?.timestamp]
  );
  
  // Reset search initiated flag when search term changes
  useEffect(() => {
    // Check if this is a new search (new timestamp) or the first search
    const isNewSearch = initialSearch?.timestamp !== searchTimestampRef.current;
    
    if (initialSearch?.searchTerm && isNewSearch) {
      console.log('[useSearchStateProvider] New search detected:', initialSearch.searchTerm);
      searchInitiatedRef.current = false;
      searchTimestampRef.current = initialSearch.timestamp || Date.now();
    }
  }, [initialSearch]);
  
  const loadingState = useLoadingState({
    timeout: 45000,
    longRunningThreshold: 20000,
    onTimeout: () => {
      const timeoutError = createAppError('Search operation timed out', {
        type: ErrorType.TIMEOUT
      });
      setError(timeoutError);
      performanceTracker.addMetadata('timeout', true);
      performanceTracker.logReport();
    }
  });
  
  const { 
    coordinates, 
    postcode,
    isLoading: isLoadingCoords, 
    error: coordsError 
  } = useCoordinates(initialSearch?.searchTerm || '');
  
  useEffect(() => {
    // Only start searching if we have a search term and haven't already initiated this search
    if (initialSearch?.searchTerm && !searchInitiatedRef.current) {
      searchInitiatedRef.current = true;
      console.log('[useSearchStateProvider] Initiating search for:', initialSearch.searchTerm);
      
      performanceTracker.mark('searchInitiated');
      loadingState.startLoading('coordinates');
      
      // Reset error state for new searches
      setError(null);
    }
  }, [initialSearch]);
  
  useEffect(() => {
    if (initialSearch?.searchTerm && !coordinates && isLoadingCoords) {
      performanceTracker.mark('coordinatesStart');
      loadingState.startLoading('coordinates');
    } else if (initialSearch?.searchTerm && coordinates) {
      console.log('[useSearchStateProvider] Got coordinates:', coordinates);
      performanceTracker.mark('coordinatesEnd');
      performanceTracker.addMetadata('coordinates', coordinates);
      if (postcode) {
        performanceTracker.addMetadata('postcode', postcode);
      }
      loadingState.setStage('searching');
    } else if (coordsError) {
      console.error('[useSearchStateProvider] Coordinates error:', coordsError);
      performanceTracker.mark('coordinatesError');
      performanceTracker.addMetadata('coordinatesError', coordsError.message);
      
      handleError(coordsError, {
        performanceData: performanceTracker.getReport()
      });
      
      setError(coordsError);
      loadingState.setError(coordsError);
    }
  }, [coordinates, postcode, isLoadingCoords, coordsError, initialSearch?.searchTerm]);
  
  // Use postcode for search if available, otherwise fallback to coordinates
  // Create a properly typed search parameter
  const searchParam = useMemo(() => {
    // If we have a postcode, use that as a string
    if (postcode) {
      return postcode;
    }
    // If we have coordinates, use those
    if (coordinates) {
      return coordinates;
    }
    // Otherwise return null
    return null;
  }, [postcode, coordinates]);
  
  const { 
    applications, 
    isLoading: isLoadingResults,
    error: searchError,
    filters,
    setFilters: updateFilters,
    hasPartialResults,
    isSearchInProgress
  } = usePlanningSearch(searchParam);
  
  useEffect(() => {
    if (searchParam && isLoadingResults) {
      performanceTracker.mark('searchStart');
      performanceTracker.addMetadata('searchType', postcode ? 'postcode' : 'coordinates');
    } else if (searchParam && !isLoadingResults) {
      performanceTracker.mark('searchEnd');
      performanceTracker.addMetadata('resultsCount', applications.length);
      loadingState.setStage('rendering');
      
      setTimeout(() => {
        loadingState.completeLoading();
        setHasSearched(true);
        performanceTracker.mark('renderEnd');
        performanceTracker.logReport();
      }, 200);
    }
  }, [searchParam, postcode, isLoadingResults, applications]);
  
  useEffect(() => {
    if (searchError && !error) {
      console.error('[useSearchStateProvider] Search error:', searchError);
      performanceTracker.mark('searchError');
      performanceTracker.addMetadata('searchError', searchError.message);
      
      handleError(searchError, {
        performanceData: performanceTracker.getReport()
      });
      
      setError(searchError);
      loadingState.setError(searchError);
    }
  }, [searchError]);
  
  useEffect(() => {
    if (applications.length > 0 && !isLoadingResults) {
      performanceTracker.mark('renderStart');
    }
  }, [applications, isLoadingResults]);
  
  const setFilters = useCallback((type: string, value: any) => {
    updateFilters({ ...filters, [type]: value });
    performanceTracker.addMetadata('filters', { ...filters, [type]: value });
  }, [filters, updateFilters]);
  
  const retry = useCallback(() => {
    console.log('[useSearchStateProvider] Retry requested for:', initialSearch?.searchTerm);
    setError(null);
    loadingState.startLoading('coordinates');
    setHasSearched(false);
    searchInitiatedRef.current = false;
    
    // Create a new performance tracker for the retry
    const newTracker = getSearchPerformanceTracker(`search-retry-${Date.now()}`);
    newTracker.mark('retryInitiated');
  }, [initialSearch]);
  
  return {
    initialSearch: initialSearch || null,
    loadingState: {
      isLoading: loadingState.isLoading,
      stage: loadingState.stage,
      longRunning: loadingState.isLongRunning,
      error: error || loadingState.error
    },
    coordinates,
    postcode,
    applications,
    filters,
    setFilters,
    retry,
    hasSearched,
    hasPartialResults,
    isSearchInProgress
  };
}
