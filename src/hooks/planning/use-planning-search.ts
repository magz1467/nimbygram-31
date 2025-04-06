
import { useState, useEffect, useCallback } from 'react';
import { Application } from '@/types/planning';

interface UsePlanningSearchOptions {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  skipSearch?: boolean;
}

export function useSearchPages({ initialSearch, skipSearch = false }: UsePlanningSearchOptions = {}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [hasPartialResults, setHasPartialResults] = useState(false);
  const [isSearchInProgress, setIsSearchInProgress] = useState(false);
  
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    stage: 'initial' as const,
    error: null as Error | null,
    longRunning: false
  });
  
  // Function to update a specific filter
  const updateFilter = (type: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  // Retry search function
  const retry = useCallback(() => {
    if (initialSearch) {
      // Reset loading state
      setLoadingState({
        isLoading: true,
        stage: 'searching',
        error: null,
        longRunning: false
      });
      
      // Fake search for now
      setTimeout(() => {
        setLoadingState({
          isLoading: false,
          stage: 'complete',
          error: null,
          longRunning: false
        });
        
        // Provide some mock data on retry
        setApplications([]);
        setHasSearched(true);
      }, 1500);
    }
  }, [initialSearch]);
  
  // Effect to handle the initial search
  useEffect(() => {
    if (initialSearch && !skipSearch) {
      const { searchTerm, timestamp } = initialSearch;
      
      if (searchTerm) {
        // Set loading state
        setLoadingState({
          isLoading: true,
          stage: 'searching',
          error: null,
          longRunning: false
        });
        
        // Fake search for now
        const timer = setTimeout(() => {
          setLoadingState({
            isLoading: false,
            stage: 'complete',
            error: null,
            longRunning: false
          });
          
          // No results for now
          setApplications([]);
          setHasSearched(true);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [initialSearch, skipSearch]);
  
  return {
    loadingState,
    applications,
    filters,
    setFilters: updateFilter,
    retry,
    hasSearched,
    hasPartialResults,
    isSearchInProgress
  };
}
