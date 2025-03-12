
import { useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { isNonCriticalError } from '@/utils/errors';
import { useSearchTelemetry } from './use-search-telemetry';
import { SearchFilters, SearchMethod } from './types';

export interface SearchErrorHandlerContext {
  coordinates: [number, number] | null;
  searchRadius: number;
  filters: SearchFilters;
  searchMethod?: SearchMethod | null;
  additionalContext?: Record<string, any>;
}

export function useSearchErrorHandler(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters
) {
  const { toast } = useToast();
  const errorRef = useRef<Error | null>(null);
  const searchMethodRef = useRef<SearchMethod | null>(null);
  const { logSearchError } = useSearchTelemetry();
  
  const handleSearchError = useCallback((err: any, context: Record<string, any> = {}) => {
    console.error('Search error:', err);
    
    // Create a structured app error with all the context
    const appError = createAppError(
      err?.message || 'Unknown search error',
      err,
      {
        type: err?.type || detectSearchErrorType(err),
        context: {
          coordinates,
          filters,
          searchRadius,
          searchMethod: searchMethodRef.current,
          ...context
        },
        recoverable: isRecoverableSearchError(err)
      }
    );
    
    // Store the error for reference
    errorRef.current = appError;
    
    // Log search error telemetry
    if (searchMethodRef.current === 'spatial' || searchMethodRef.current === 'fallback') {
      logSearchError(
        coordinates,
        searchRadius,
        filters,
        appError.type as ErrorType,
        appError.message,
        searchMethodRef.current
      );
    } else {
      // Handle 'cache' method or null case
      logSearchError(
        coordinates,
        searchRadius,
        filters,
        appError.type as ErrorType,
        appError.message,
        null
      );
    }
    
    // Only show toast notifications for errors that are meaningful to users
    if (!isNonCriticalError(err)) {
      toast({
        title: "Search Error",
        description: appError.userMessage || "There was an issue with your search. Please try again.",
        variant: "destructive"
      });
    }
    
    return appError;
  }, [toast, coordinates, filters, searchRadius, logSearchError]);
  
  return {
    handleSearchError,
    errorRef,
    searchMethodRef
  };
}

// Helper functions that can be used without the hook context

/**
 * Detect error type specific to search functionality
 */
export function detectSearchErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : '';
  
  if (message.includes('coordinates') || message.includes('location')) {
    return ErrorType.COORDINATES;
  }
  
  if (message.includes('timeout') || 
      message.includes('too long') || 
      message.includes('canceling statement') ||
      message.includes('statement_timeout')) {
    return ErrorType.TIMEOUT;
  }
  
  if (message.includes('get_nearby_applications')) {
    return ErrorType.SEARCH;
  }
  
  // Fallback to generic error detection
  if (message.includes('network') || message.includes('fetch') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('database') || message.includes('sql')) {
    return ErrorType.DATABASE;
  } else if (message.includes('permission') || message.includes('access')) {
    return ErrorType.PERMISSION;
  }
  
  return ErrorType.SEARCH;
}

/**
 * Determine if a search error is recoverable
 */
export function isRecoverableSearchError(error: any): boolean {
  const type = detectSearchErrorType(error);
  
  // Network, timeout, and some database errors are potentially recoverable
  return (
    type === ErrorType.NETWORK || 
    type === ErrorType.TIMEOUT ||
    (type === ErrorType.DATABASE && error?.message?.includes('statement_timeout'))
  );
}
