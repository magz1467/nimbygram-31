
import { createContext, useContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLoadingState, LoadingStage } from '@/hooks/use-loading-state';
import { useCoordinates } from '@/hooks/use-coordinates';
import { usePlanningSearch } from '@/hooks/planning/use-planning-search';
import { handleError } from '@/utils/errors/centralized-handler';
import { getSearchPerformanceTracker } from '@/utils/performance/search-performance-tracker';
import { ErrorType } from '@/utils/errors';
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
  applications: Application[];
  filters: Record<string, any>;
  setFilters: (type: string, value: any) => void;
  retry: () => void;
  hasSearched: boolean;
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
  
  // Performance tracking
  const performanceTracker = useMemo(() => 
    getSearchPerformanceTracker(`search-${initialSearch?.timestamp || Date.now()}`),
    [initialSearch?.timestamp]
  );
  
  // Centralized loading state
  const loadingState = useLoadingState({
    timeout: 45000, // 45 second timeout for the entire search flow
    longRunningThreshold: 8000, // Show long-running UI after 8 seconds
    onTimeout: () => {
      const timeoutError = new Error('Search operation timed out');
      // @ts-ignore - Adding type property to Error
      timeoutError.type = ErrorType.TIMEOUT;
      setError(timeoutError);
      performanceTracker.addMetadata('timeout', true);
      performanceTracker.logReport();
    }
  });
  
  // Get coordinates from search term
  const { 
    coordinates, 
    isLoading: isLoadingCoords, 
    error: coordsError 
  } = useCoordinates(initialSearch?.searchTerm || '');
  
  // Track coordinates loading
  useEffect(() => {
    if (initialSearch?.searchTerm && !coordinates && isLoadingCoords) {
      performanceTracker.mark('coordinatesStart');
      loadingState.startLoading('coordinates');
    } else if (initialSearch?.searchTerm && coordinates) {
      performanceTracker.mark('coordinatesEnd');
      performanceTracker.addMetadata('coordinates', coordinates);
      loadingState.setStage('searching');
    } else if (coordsError) {
      performanceTracker.mark('coordinatesError');
      performanceTracker.addMetadata('coordinatesError', coordsError.message);
      
      handleError(coordsError, 'coordinates-resolution', {
        performanceData: performanceTracker.getReport()
      });
      
      setError(coordsError);
      loadingState.setError(coordsError);
    }
  }, [coordinates, isLoadingCoords, coordsError, initialSearch?.searchTerm]);
  
  // Perform search when coordinates are available
  const { 
    applications, 
    isLoading: isLoadingResults,
    error: searchError,
    filters,
    setFilters: updateFilters
  } = usePlanningSearch(coordinates);
  
  // Track search loading
  useEffect(() => {
    if (coordinates && isLoadingResults) {
      performanceTracker.mark('searchStart');
    } else if (coordinates && !isLoadingResults) {
      performanceTracker.mark('searchEnd');
      performanceTracker.addMetadata('resultsCount', applications.length);
      loadingState.setStage('rendering');
      
      // Complete loading after a short delay to allow rendering
      setTimeout(() => {
        loadingState.completeLoading();
        setHasSearched(true);
        performanceTracker.mark('renderEnd');
        performanceTracker.logReport();
      }, 200);
    }
  }, [coordinates, isLoadingResults, applications]);
  
  // Handle search errors
  useEffect(() => {
    if (searchError && !error) {
      performanceTracker.mark('searchError');
      performanceTracker.addMetadata('searchError', searchError.message);
      
      handleError(searchError, 'search-execution', {
        performanceData: performanceTracker.getReport()
      });
      
      setError(searchError);
      loadingState.setError(searchError);
    }
  }, [searchError]);
  
  // Start rendering
  useEffect(() => {
    if (applications.length > 0 && !isLoadingResults) {
      performanceTracker.mark('renderStart');
    }
  }, [applications, isLoadingResults]);
  
  // Method to set filters
  const setFilters = useCallback((type: string, value: any) => {
    updateFilters({ ...filters, [type]: value });
    performanceTracker.addMetadata('filters', { ...filters, [type]: value });
  }, [filters, updateFilters]);
  
  // Method to retry
  const retry = useCallback(() => {
    setError(null);
    loadingState.startLoading('coordinates');
    setHasSearched(false);
    
    // Reset performance tracker
    getSearchPerformanceTracker(`search-retry-${Date.now()}`);
    
    // Force reload to restart the entire flow
    window.location.reload();
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
    applications,
    filters,
    setFilters,
    retry,
    hasSearched
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
