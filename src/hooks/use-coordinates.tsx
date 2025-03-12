
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';
import { useCoordinatesFetch } from './coordinates/use-coordinates-fetch';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

export const useCoordinates = (searchTerm: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { fetchCoordinates, isLoading, setIsLoading } = useCoordinatesFetch();

  useEffect(() => {
    let isMounted = true;

    const performCoordinatesSearch = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      if (!searchTerm) {
        logCoordinatesOperation('search', 'No search term provided');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      
      searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, { searchTerm });
      
      try {
        const locationCoords = await fetchCoordinates(searchTerm);
        
        if (isMounted && locationCoords) {
          searchTelemetry.logEvent(TelemetryEventType.COORDINATES_RESOLVED, {
            searchTerm,
            coordinates: locationCoords
          });
          
          setCoordinates(locationCoords);
        }
      } catch (error: any) {
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
