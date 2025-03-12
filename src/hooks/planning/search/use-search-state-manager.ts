
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
  
  // Track if we've already completed this search to prevent duplicate state updates
  const searchStartedRef = useRef(false);
  const searchCompletedRef = useRef(false);
  
  // Only expose controlled methods to update state
  const startSearch = useCallback(() => {
    // Prevent duplicate starts
    if (searchStartedRef.current && stateRef.current.isLoading) {
      console.log('🔍 Search already in progress, ignoring duplicate start');
      return;
    }
    
    console.log('🔍 Search state manager: Starting search');
    searchStartedRef.current = true;
    searchCompletedRef.current = false;
    
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
    // Skip redundant updates
    if (
      stateRef.current.stage === stage && 
      Math.abs(stateRef.current.progress - progress) < 2
    ) {
      return;
    }
    
    console.log(`🔄 Search state manager: Updating progress - ${stage} (${progress}%)`);
    setState(prev => ({
      ...prev,
      stage,
      progress,
      isLoading: true
    }));
  }, []);

  const setSearchMethod = useCallback((method: SearchMethod) => {
    // Skip if method hasn't changed
    if (stateRef.current.method === method) {
      return;
    }
    
    console.log(`🔍 Search state manager: Setting search method - ${method}`);
    setState(prev => ({
      ...prev,
      method
    }));
  }, []);

  const setResults = useCallback((results: Application[]) => {
    // Skip if results haven't changed (same length and first/last items)
    if (
      stateRef.current.results.length === results.length &&
      results.length > 0 &&
      stateRef.current.results.length > 0 &&
      stateRef.current.results[0].id === results[0].id &&
      stateRef.current.results[stateRef.current.results.length - 1].id === results[results.length - 1].id
    ) {
      return;
    }
    
    console.log(`✅ Search state manager: Setting results - ${results.length} items`);
    setState(prev => ({
      ...prev,
      results,
      hasResults: results.length > 0
    }));
  }, []);

  const completeSearch = useCallback(() => {
    // Skip if search is already completed
    if (searchCompletedRef.current) {
      return;
    }
    
    console.log('✅ Search state manager: Completing search');
    searchCompletedRef.current = true;
    searchStartedRef.current = false;
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'complete',
      progress: 100
    }));
  }, []);

  const failSearch = useCallback((error: Error) => {
    console.log('❌ Search state manager: Search failed', error);
    searchCompletedRef.current = true;
    searchStartedRef.current = false;
    
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
    searchStartedRef.current = false;
    searchCompletedRef.current = false;
    
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
