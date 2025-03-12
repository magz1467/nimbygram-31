
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';
import { useCoordinatesFetch } from './coordinates/use-coordinates-fetch';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

// Cache for storing previously resolved coordinates
const coordinatesCache: Record<string, [number, number]> = {
  // Preload known problematic areas with their coordinates
  'HP22 6JJ': [51.765769, -0.744319], // Wendover
  'WENDOVER': [51.765769, -0.744319],
};

export const useCoordinates = (searchTerm: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { fetchCoordinates, isLoading, setIsLoading } = useCoordinatesFetch();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let isMounted = true;
    retryCountRef.current = 0;

    const performCoordinatesSearch = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      if (!searchTerm) {
        logCoordinatesOperation('search', 'No search term provided');
        return;
      }
      
      const normalizedSearchTerm = searchTerm.trim().toUpperCase();
      
      // Check cache first
      if (coordinatesCache[normalizedSearchTerm]) {
        console.log(`📍 Using cached coordinates for: ${searchTerm}`);
        if (isMounted) {
          setCoordinates(coordinatesCache[normalizedSearchTerm]);
          setIsLoading(false);
        }
        return;
      }
      
      // Special case for Wendover
      if (normalizedSearchTerm.includes('HP22 6JJ') || normalizedSearchTerm.includes('WENDOVER')) {
        console.log(`📍 Special case handling for Wendover: ${searchTerm}`);
        if (isMounted) {
          setCoordinates([51.765769, -0.744319]);
          setIsLoading(false);
        }
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      
      searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, { searchTerm });
      
      try {
        const locationCoords = await fetchCoordinates(searchTerm);
        
        if (isMounted && locationCoords) {
          // Cache the result
          coordinatesCache[normalizedSearchTerm] = locationCoords;
          
          searchTelemetry.logEvent(TelemetryEventType.COORDINATES_RESOLVED, {
            searchTerm,
            coordinates: locationCoords
          });
          
          setCoordinates(locationCoords);
        }
      } catch (error: any) {
        console.error(`Failed to get coordinates for ${searchTerm}:`, error);
        
        // If we have retries left, try again
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(`Retrying coordinates fetch (${retryCountRef.current}/${MAX_RETRIES}) for ${searchTerm}`);
          
          // Slight delay before retry
          setTimeout(() => {
            if (isMounted) {
              performCoordinatesSearch();
            }
          }, 1000);
          return;
        }
        
        const appError = createAppError(
          `We couldn't find the location "${searchTerm}". Please try a more specific UK location or postcode.`,
          error,
          {
            type: error.type || ErrorType.UNKNOWN,
            context: { searchTerm }
          }
        );
        
        searchTelemetry.logEvent(TelemetryEventType.COORDINATES_ERROR, {
          searchTerm,
          errorType: appError.type,
          errorMessage: appError.message
        });
        
        toast({
          title: "Location Error",
          description: appError.userMessage,
          variant: "destructive",
        });
        
        if (isMounted) {
          setError(appError);
          setCoordinates(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    };

    if (searchTerm?.trim()) {
      performCoordinatesSearch();
    } else {
      setCoordinates(null);
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchTerm, toast, fetchCoordinates, setIsLoading]);

  return { coordinates, isLoading, error };
};
