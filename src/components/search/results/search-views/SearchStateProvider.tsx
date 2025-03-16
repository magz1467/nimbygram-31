
import { createContext, useContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLoadingState, LoadingStage } from '@/hooks/use-loading-state';
import { useCoordinates } from '@/hooks/use-coordinates';
import { usePlanningSearch } from '@/hooks/planning/use-planning-search';
import { handleError } from '@/utils/errors/centralized-handler';
import { getSearchPerformanceTracker } from '@/utils/performance/search-performance-tracker';
import { ErrorType, AppError, createAppError } from '@/utils/errors/types';
import { Application } from '@/types/planning';

interface SearchStateContextProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  } | null;
  loadingState: {
    isLoading: boolean;
    stage: LoadingStage;
    longRunning: boolean;
    error: Error | null;
  };
  coordinates: [number, number] | null;
  postcode: string | null;
  applications: Application[];
  filters: Record<string, any>;
  setFilters: (type: string, value: any) => void;
  retry: () => void;
  hasSearched: boolean;
  hasPartialResults: boolean;
  isSearchInProgress: boolean;
}

const SearchStateContext = createContext<SearchStateContextProps | null>(null);

export function SearchStateProvider({ 
  children, 
  initialSearch 
}: { 
  children: ReactNode;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
}) {
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const performanceTracker = useMemo(() => 
    getSearchPerformanceTracker(`search-${initialSearch?.timestamp || Date.now()}`),
    [initialSearch?.timestamp]
  );
  
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
    if (initialSearch?.searchTerm && !coordinates && isLoadingCoords) {
      performanceTracker.mark('coordinatesStart');
      loadingState.startLoading('coordinates');
    } else if (initialSearch?.searchTerm && coordinates) {
      performanceTracker.mark('coordinatesEnd');
      performanceTracker.addMetadata('coordinates', coordinates);
      if (postcode) {
        performanceTracker.addMetadata('postcode', postcode);
      }
      loadingState.setStage('searching');
    } else if (coordsError) {
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
  const searchParam = postcode || coordinates;
  
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
    setError(null);
    loadingState.startLoading('coordinates');
    setHasSearched(false);
    
    getSearchPerformanceTracker(`search-retry-${Date.now()}`);
    
    // Removed window.location.reload() to prevent page reload
    console.log('Retry search requested');
  }, []);
  
  const value = {
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
  
  return (
    <SearchStateContext.Provider value={value}>
      {children}
    </SearchStateContext.Provider>
  );
}

export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
}
