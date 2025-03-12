import { useState, useRef, useCallback } from 'react';
import { Application } from '@/types/planning';
import { SearchMethod, SearchFilters } from './types';

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

export interface SearchStateManager {
  state: SearchState;
  startSearch: () => void;
  updateProgress: (stage: SearchStage, progress: number) => void;
  setSearchMethod: (method: SearchMethod) => void;
  setResults: (results: Application[]) => void;
  completeSearch: () => void;
  failSearch: (error: Error) => void;
  resetSearch: () => void;
}

/**
 * Hook that provides centralized search state management
 * to reduce component rerenders and provide a consistent loading experience
 */
export function useSearchStateManager(): SearchStateManager {
  // Create a single source of truth for search state
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    stage: 'idle',
    progress: 0,
    error: null,
    method: null,
    results: [],
    hasResults: false
  });

  // Use refs to track state without causing rerenders
  const stateRef = useRef(state);
  stateRef.current = state;
  
  // Only expose controlled methods to update state
  const startSearch = useCallback(() => {
    console.log('🔍 Search state manager: Starting search');
    setState({
      isLoading: true,
      stage: 'coordinates',
      progress: 0,
      error: null,
      method: null,
      results: stateRef.current.results, // Preserve previous results until new ones arrive
      hasResults: stateRef.current.hasResults
    });
  }, []);

  const updateProgress = useCallback((stage: SearchStage, progress: number) => {
    console.log(`🔄 Search state manager: Updating progress - ${stage} (${progress}%)`);
    setState(prev => ({
      ...prev,
      stage,
      progress,
      isLoading: true
    }));
  }, []);

  const setSearchMethod = useCallback((method: SearchMethod) => {
    console.log(`🔍 Search state manager: Setting search method - ${method}`);
    setState(prev => ({
      ...prev,
      method
    }));
  }, []);

  const setResults = useCallback((results: Application[]) => {
    console.log(`✅ Search state manager: Setting results - ${results.length} items`);
    setState(prev => ({
      ...prev,
      results,
      hasResults: results.length > 0
    }));
  }, []);

  const completeSearch = useCallback(() => {
    console.log('✅ Search state manager: Completing search');
    setState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'complete',
      progress: 100
    }));
  }, []);

  const failSearch = useCallback((error: Error) => {
    console.log('❌ Search state manager: Search failed', error);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      // Keep existing results if we have them, even on error
      hasResults: prev.results.length > 0
    }));
  }, []);

  const resetSearch = useCallback(() => {
    console.log('🔄 Search state manager: Resetting search state');
    setState({
      isLoading: false,
      stage: 'idle',
      progress: 0,
      error: null,
      method: null,
      results: [],
      hasResults: false
    });
  }, []);

  return {
    state,
    startSearch,
    updateProgress,
    setSearchMethod,
    setResults,
    completeSearch,
    failSearch,
    resetSearch
  };
}
