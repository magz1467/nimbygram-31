
import { useState, useEffect, useRef } from 'react';
import { 
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesByLocationName,
  fetchCoordinatesFromPostcodesIo,
  detectLocationType,
  extractPlaceName
} from '@/services/coordinates';
import { useToast } from '@/hooks/use-toast';
import { createAppError } from '@/utils/errors/error-factory';
import { ErrorType } from '@/utils/errors/types';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

// Helper function to implement timeout for promises
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(createAppError(timeoutMessage, null, { type: ErrorType.TIMEOUT })), timeoutMs)
    )
  ]) as Promise<T>;
};

export const useCoordinates = (searchTerm: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      if (!searchTerm) {
        console.log('❌ useCoordinates: No search term provided');
        return;
      }
      
      // Reset state on new request
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      
      console.log('🔍 useCoordinates: Fetching coordinates for:', searchTerm);
      
      // Log telemetry
      searchTelemetry.logEvent(TelemetryEventType.SEARCH_STARTED, {
        searchTerm
      });
      
      try {
        // Determine what type of location string we have
        const locationType = detectLocationType(searchTerm);
        let locationCoords: [number, number] | null = null;
        
        // Choose the right method based on what we're dealing with
        switch (locationType) {
          case 'PLACE_ID':
            console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
            
            // Use retry logic if enabled
            if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
              locationCoords = await withRetry(
                async () => withTimeout(
                  fetchCoordinatesFromPlaceId(searchTerm),
                  10000,
                  "Timeout while retrieving location details"
                ),
                {
                  maxRetries: 2,
                  retryableErrors: (err) => {
                    const errMsg = err?.message?.toLowerCase() || '';
                    return errMsg.includes('network') || errMsg.includes('timeout');
                  },
                  onRetry: (err, attempt, delay) => {
                    console.log(`Retrying place ID lookup (attempt ${attempt}) in ${delay}ms`);
                  }
                }
              );
            } else {
              locationCoords = await withTimeout(
                fetchCoordinatesFromPlaceId(searchTerm),
                10000,
                "Timeout while retrieving location details"
              );
            }
            break;
            
          case 'LOCATION_NAME':
            console.log('🏙️ Detected location name:', searchTerm);
            
            try {
              // First try with the full search term
              console.log('🔍 Searching for exact location name:', searchTerm);
              
              if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
                locationCoords = await withRetry(
                  async () => withTimeout(
                    fetchCoordinatesByLocationName(searchTerm),
                    10000,
                    "Timeout while searching for location"
                  ),
                  {
                    maxRetries: 2,
                    retryableErrors: (err) => {
                      const errMsg = err?.message?.toLowerCase() || '';
                      return errMsg.includes('network') || errMsg.includes('timeout');
                    },
                    onRetry: (err, attempt, delay) => {
                      console.log(`Retrying location name lookup (attempt ${attempt}) in ${delay}ms`);
                    }
                  }
                );
              } else {
                locationCoords = await withTimeout(
                  fetchCoordinatesByLocationName(searchTerm),
                  10000,
                  "Timeout while searching for location"
                );
              }
              
              if (locationCoords) {
                console.log('✅ Found coordinates for location:', locationCoords);
              }
            } catch (locationError) {
              console.warn('⚠️ Location search failed:', locationError.message);
              
              // Extract simplified place name as fallback
              const placeName = extractPlaceName(searchTerm);
              if (placeName && placeName !== searchTerm) {
                try {
                  console.log('🔍 Trying with simplified place name:', placeName);
                  
                  if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
                    locationCoords = await withRetry(
                      async () => withTimeout(
                        fetchCoordinatesByLocationName(placeName),
                        10000,
                        "Timeout while searching for simplified location"
                      ),
                      {
                        maxRetries: 2,
                        retryableErrors: (err) => {
                          const errMsg = err?.message?.toLowerCase() || '';
                          return errMsg.includes('network') || errMsg.includes('timeout');
                        },
                        onRetry: (err, attempt, delay) => {
                          console.log(`Retrying simplified location name lookup (attempt ${attempt}) in ${delay}ms`);
                        }
                      }
                    );
                  } else {
                    locationCoords = await withTimeout(
                      fetchCoordinatesByLocationName(placeName),
                      10000,
                      "Timeout while searching for simplified location"
                    );
                  }
                  
                  if (locationCoords) {
                    console.log('✅ Found coordinates for simplified location:', locationCoords);
                  }
                } catch (fallbackError) {
                  console.error('❌ Both direct and simplified location searches failed');
                  throw fallbackError;
                }
              } else {
                throw locationError;
              }
            }
            break;
            
          case 'POSTCODE':
            // Regular UK postcode - use Postcodes.io
            console.log('📫 Regular postcode detected, using Postcodes.io API');
            
            if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
              locationCoords = await withRetry(
                async () => withTimeout(
                  fetchCoordinatesFromPostcodesIo(searchTerm),
                  10000,
                  "Timeout while looking up postcode"
                ),
                {
                  maxRetries: 2,
                  retryableErrors: (err) => {
                    const errMsg = err?.message?.toLowerCase() || '';
                    return errMsg.includes('network') || errMsg.includes('timeout');
                  },
                  onRetry: (err, attempt, delay) => {
                    console.log(`Retrying postcode lookup (attempt ${attempt}) in ${delay}ms`);
                  }
                }
              );
            } else {
              locationCoords = await withTimeout(
                fetchCoordinatesFromPostcodesIo(searchTerm),
                10000,
                "Timeout while looking up postcode"
              );
            }
            break;
        }
        
        if (isMounted && locationCoords) {
          // Log telemetry for successful coordinates resolution
          searchTelemetry.logEvent(TelemetryEventType.COORDINATES_RESOLVED, {
            searchTerm,
            coordinates: locationCoords,
            locationType
          });
          
          setCoordinates(locationCoords);
        }
      } catch (error: any) {
        console.error("❌ useCoordinates: Error fetching coordinates:", error.message);
        
        // Create application error
        const appError = createAppError(
          `We couldn't find the location "${searchTerm}". Please try a more specific UK location or postcode.`,
          error,
          {
            type: error.type || ErrorType.UNKNOWN,
            context: { searchTerm }
          }
        );
        
        // Log telemetry for error
        searchTelemetry.logEvent(TelemetryEventType.COORDINATES_ERROR, {
          searchTerm,
          errorType: appError.type,
          errorMessage: appError.message
        });
        
        // Show user-friendly error toast
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
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    };

    if (searchTerm && searchTerm.trim()) {
      console.log('🔄 useCoordinates: Search term changed, fetching new coordinates:', searchTerm);
      fetchCoordinates();
    } else {
      setCoordinates(null);
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
      
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchTerm, toast]);

  return { coordinates, isLoading, error };
};
