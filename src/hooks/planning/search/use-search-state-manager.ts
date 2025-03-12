import { useState, useRef, useCallback, useEffect } from 'react';
import { Application } from '@/types/planning';
import { SearchMethod, SearchFilters, SearchParams, SearchResult } from './types';

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
  const [state, setState] = useState<SearchState>(initialState);
  const searchInProgressRef = useRef(false);
  const lastSearchParamsRef = useRef<SearchParams | null>(null);

  const updateProgress = useCallback((stage: SearchStage, progress: number) => {
    setState(prev => ({
      ...prev,
      stage,
      progress,
      isLoading: stage !== 'complete' && stage !== 'idle'
    }));
  }, []);

  const updateMethod = useCallback((method: SearchMethod) => {
    setState(prev => ({
      ...prev,
      method
    }));
  }, []);

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

  const startSearch = useCallback(async (searchParams: SearchParams) => {
    if (searchInProgressRef.current) {
      console.log('Search already in progress, ignoring request');
      return;
    }
    
    if (lastSearchParamsRef.current && 
        JSON.stringify(lastSearchParamsRef.current) === JSON.stringify(searchParams)) {
      console.log('Duplicate search params, skipping search');
      return;
    }
    
    searchInProgressRef.current = true;
    lastSearchParamsRef.current = searchParams;
    
    setState(prev => ({
      ...initialState,
      isLoading: true,
      stage: 'coordinates',
      progress: 10
    }));
    
    try {
      const result: SearchResult = await executeSearch(searchParams, {
        onProgress: updateProgress,
        onMethodChange: updateMethod
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'complete',
        progress: 100,
        results: result.applications,
        method: result.method,
        hasResults: result.applications.length > 0,
        error: null
      }));
      
    } catch (error) {
      handleSearchError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      searchInProgressRef.current = false;
    }
  }, [updateProgress, updateMethod, handleSearchError]);

  const cancelSearch = useCallback(() => {
    if (searchInProgressRef.current) {
      searchInProgressRef.current = false;
      setState(initialState);
    }
  }, []);

  useEffect(() => {
    return () => {
      searchInProgressRef.current = false;
    };
  }, []);

  return {
    ...state,
    startSearch,
    cancelSearch,
    _updateProgress: updateProgress,
    _updateMethod: updateMethod
  };
}
