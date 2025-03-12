
import { useState } from 'react';
import { fetchCoordinatesFromPlaceId } from '@/services/coordinates';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

export const usePlaceIdFetch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoordinates = async (placeId: string): Promise<[number, number]> => {
    setIsLoading(true);
    logCoordinatesOperation('fetch', { type: 'place_id', term: placeId });
    
    try {
      let locationCoords: [number, number];
      
      if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
        locationCoords = await withRetry(
          async () => withTimeout(
            fetchCoordinatesFromPlaceId(placeId),
            10000,
            "Timeout while retrieving location details"
          ),
          {
            maxRetries: 2,
            retryableErrors: (err) => {
              const errMsg = err?.message?.toLowerCase() || '';
              return errMsg.includes('network') || errMsg.includes('timeout');
            },
            onRetry: (err, attempt) => logCoordinatesOperation('retry', { attempt, error: err })
          }
        );
      } else {
        locationCoords = await withTimeout(
          fetchCoordinatesFromPlaceId(placeId),
          10000,
          "Timeout while retrieving location details"
        );
      }
      
      return locationCoords;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCoordinates,
    isLoading,
    setIsLoading
  };
};
