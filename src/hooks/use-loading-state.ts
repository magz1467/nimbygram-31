
import { useState, useCallback, useEffect, useRef } from 'react';

export type LoadingStage = 
  | 'idle'
  | 'coordinates'
  | 'searching'
  | 'rendering'
  | 'complete'
  | 'error';

interface LoadingState {
  isLoading: boolean;
  stage: LoadingStage;
  longRunning: boolean;
  progress: number;
  error: Error | null;
}

export interface UseLoadingStateParams {
  timeout?: number;
  longRunningThreshold?: number;
  onTimeout?: () => void;
}

/**
 * Hook for managing centralized loading states across the search flow
 */
export function useLoadingState({
  timeout = 30000, // 30 second timeout by default
  longRunningThreshold = 5000, // 5 seconds threshold for long-running operations
  onTimeout
}: UseLoadingStateParams = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    stage: 'idle',
    longRunning: false,
    progress: 0,
    error: null
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longRunningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const startLoading = useCallback((stage: LoadingStage = 'searching') => {
    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (longRunningTimeoutRef.current) clearTimeout(longRunningTimeoutRef.current);
    
    startTimeRef.current = Date.now();
    
    setState({
      isLoading: true,
      stage,
      longRunning: false,
      progress: 0,
      error: null
    });
    
    // Set timeout for operation
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'error',
        error: new Error(`Operation timed out after ${timeout / 1000} seconds`)
      }));
    }, timeout);
    
    // Set timeout for long-running detection
    longRunningTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        longRunning: true
      }));
    }, longRunningThreshold);
  }, [timeout, longRunningThreshold, onTimeout]);
  
  const setStage = useCallback((stage: LoadingStage) => {
    setState(prev => ({
      ...prev,
      stage
    }));
  }, []);
  
  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);
  
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      stage: error ? 'error' : prev.stage,
      isLoading: error ? false : prev.isLoading
    }));
  }, []);
  
  const completeLoading = useCallback(() => {
    // Calculate elapsed time
    const elapsedTime = Date.now() - startTimeRef.current;
    console.info(`Loading completed in ${elapsedTime}ms`);
    
    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (longRunningTimeoutRef.current) clearTimeout(longRunningTimeoutRef.current);
    
    setState({
      isLoading: false,
      stage: 'complete',
      longRunning: false,
      progress: 100,
      error: null
    });
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (longRunningTimeoutRef.current) clearTimeout(longRunningTimeoutRef.current);
    };
  }, []);
  
  return {
    ...state,
    startLoading,
    setStage,
    setProgress,
    setError,
    completeLoading,
    isLongRunning: state.longRunning
  };
}
