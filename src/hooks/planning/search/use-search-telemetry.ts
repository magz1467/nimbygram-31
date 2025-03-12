
import { useCallback } from 'react';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';
import { SearchFilters } from './types';
import { ErrorType } from '@/utils/errors/types';

export function useSearchTelemetry() {
  const logSearchStarted = useCallback((coordinates: [number, number], radius: number, filters: SearchFilters) => {
    searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, {
      coordinates,
      radius,
      filters
    });
  }, []);
  
  const logSearchCompleted = useCallback((
    coordinates: [number, number], 
    radius: number, 
    filters: SearchFilters,
    resultCount: number,
    searchMethod: 'spatial' | 'fallback' | 'cache'
  ) => {
    searchTelemetry.logEvent(TelemetryEventType.SEARCH_COMPLETED, {
      coordinates,
      radius,
      filters,
      resultCount,
      searchMethod
    });
  }, []);
  
  const logSearchError = useCallback((
    coordinates: [number, number] | null, 
    radius: number, 
    filters: SearchFilters,
    errorType: ErrorType,
    errorMessage: string,
    searchMethod: 'spatial' | 'fallback' | null
  ) => {
    searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
      coordinates,
      radius,
      filters,
      errorType,
      errorMessage,
      searchMethod
    });
  }, []);
  
  return {
    logSearchStarted,
    logSearchCompleted,
    logSearchError
  };
}
