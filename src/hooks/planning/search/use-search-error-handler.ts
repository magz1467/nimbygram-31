
import { useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { useSearchTelemetry } from './use-search-telemetry';
import { SearchFilters } from './types';

export function useSearchErrorHandler(
  coordinates: [number, number] | null,
  searchRadius: number,
  filters: SearchFilters
) {
  const { toast } = useToast();
  const errorRef = useRef<Error | null>(null);
  const searchMethodRef = useRef<'spatial' | 'fallback' | null>(null);
  const { logSearchError } = useSearchTelemetry();
  
  const handleSearchError = useCallback((err: any, context: any = {}) => {
    console.error('Search error:', err);
    
    const appError = createAppError(
      err?.message || 'Unknown search error',
      err,
      {
        type: err?.type || ErrorType.UNKNOWN,
        context: {
          coordinates,
          filters,
          searchRadius,
          ...context
        }
      }
    );
    
    errorRef.current = appError;
    
    logSearchError(
      coordinates,
      searchRadius,
      filters,
      appError.type as ErrorType,
      appError.message,
      searchMethodRef.current
    );
    
    if (err?.message?.includes('get_nearby_applications') || 
        err?.message?.includes('Could not find the function')) {
      console.log('Not showing error for missing RPC function');
      return;
    }
    
    toast({
      title: "Search Error",
      description: appError.userMessage || "There was an issue with your search. Please try again.",
      variant: "destructive"
    });
  }, [toast, coordinates, filters, searchRadius, logSearchError]);
  
  return {
    handleSearchError,
    errorRef,
    searchMethodRef
  };
}
