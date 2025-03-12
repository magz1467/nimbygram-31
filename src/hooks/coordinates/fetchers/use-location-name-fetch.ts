
import { useState } from 'react';
import { fetchCoordinatesByLocationName, extractPlaceName } from '@/services/coordinates';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

export const useLocationNameFetch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocationByName = async (locationName: string): Promise<[number, number]> => {
    logCoordinatesOperation('fetch', { type: 'location_name', term: locationName });
    setIsLoading(true);
    
    try {
      if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
        return await withRetry(
          async () => withTimeout(
            fetchCoordinatesByLocationName(locationName),
            10000,
            "Timeout while searching for location"
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
      }
      return await withTimeout(
        fetchCoordinatesByLocationName(locationName),
        10000,
        "Timeout while searching for location"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoordinates = async (locationName: string): Promise<[number, number]> => {
    try {
      return await fetchLocationByName(locationName);
    } catch (locationError) {
      // Try with a simplified place name if the original search fails
      const placeName = extractPlaceName(locationName);
      if (placeName && placeName !== locationName) {
        return await fetchLocationByName(placeName);
      }
      throw locationError;
    }
  };

  return {
    fetchCoordinates,
    isLoading,
    setIsLoading
  };
};
