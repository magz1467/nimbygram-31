
import { useState, useRef, useCallback, useEffect } from 'react';
import { Application } from '@/types/planning';
import { SearchMethod, SearchFilters, SearchParams } from './types';
import { executeSearch } from './search-executor';

export type SearchStage = 'idle' | 'coordinates' | 'searching' | 'processing' | 'complete';

export interface SearchState {
  isLoading: boolean;
  stage: SearchStage;
  progress: number;
  error: Error | null;
  method: SearchMethod | null;
  results: Application[];
  hasResults: boolean;
}

const initialState: SearchState = {
  isLoading: false,
  stage: 'idle',
  progress: 0,
  error: null,
  method: null,
  results: [],
  hasResults: false
};

export function useSearchStateManager() {
  // Use a single state object to prevent partial updates
  const [state, setState] = useState<SearchState>(initialState);
  
  // Use refs to track if the search is in progress to prevent race conditions
  const searchInProgressRef = useRef(false);
  
  // Track the last search params to prevent duplicate searches
  const lastSearchParamsRef = useRef<SearchParams | null>(null);
  
  // Memoize the callback to update progress to prevent rerenders
  const updateProgress = useCallback((stage: SearchStage, progress: number) => {
    setState(prev => ({
      ...prev,
      stage,
      progress,
      isLoading: stage !== 'complete' && stage !== 'idle'
    }));
  }, []);
  
  // Memoize the callback to update method to prevent rerenders
  const updateMethod = useCallback((method: SearchMethod) => {
    setState(prev => ({
      ...prev,
      method
    }));
  }, []);
  
  // Handle search errors with a dedicated function
  const handleSearchError = useCallback((error: Error) => {
    console.error('Search error:', error);
    setState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'idle',
      progress: 0,
      error
    }));
    searchInProgressRef.current = false;
  }, []);
  
  // Start a new search with the given parameters
  const startSearch = useCallback(async (searchParams: SearchParams) => {
    // Check if a search is already in progress or if this is a duplicate search
    if (searchInProgressRef.current) {
      console.log('Search already in progress, ignoring request');
      return;
    }
    
    // Compare with last search params to prevent duplicate searches
    if (lastSearchParamsRef.current && 
        JSON.stringify(lastSearchParamsRef.current) === JSON.stringify(searchParams)) {
      console.log('Duplicate search params, skipping search');
      return;
    }
    
    // Update refs and state
    searchInProgressRef.current = true;
    lastSearchParamsRef.current = searchParams;
    
    // Reset state to initial values with a single state update
    setState(prev => ({
      ...initialState,
      isLoading: true,
      stage: 'coordinates',
      progress: 10
    }));
    
    try {
      // Execute the search
      const { applications, method } = await executeSearch(searchParams, {
        onProgress: updateProgress,
        onMethodChange: updateMethod
      });
      
      // Update state with results in a single update
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'complete',
        progress: 100,
        results: applications,
        hasResults: applications.length > 0,
        error: null
      }));
      
    } catch (error) {
      handleSearchError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      searchInProgressRef.current = false;
    }
  }, [updateProgress, updateMethod, handleSearchError]);
  
  // Cancel the current search
  const cancelSearch = useCallback(() => {
    if (searchInProgressRef.current) {
      searchInProgressRef.current = false;
      setState(initialState);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set the ref to false to prevent any pending callbacks from updating state
      searchInProgressRef.current = false;
    };
  }, []);
  
  return {
    ...state,
    startSearch,
    cancelSearch,
    // Expose for testing/debugging
    _updateProgress: updateProgress,
    _updateMethod: updateMethod
  };
}
