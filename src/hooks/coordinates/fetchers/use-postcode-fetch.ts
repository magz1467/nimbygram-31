
import { useState } from 'react';
import { fetchCoordinatesFromPostcodesIo } from '@/services/coordinates';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

export const usePostcodeFetch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoordinates = async (postcode: string): Promise<[number, number]> => {
    setIsLoading(true);
    logCoordinatesOperation('fetch', { type: 'postcode', term: postcode });
    
    try {
      if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
        return await withRetry(
          async () => withTimeout(
            fetchCoordinatesFromPostcodesIo(postcode),
            10000,
            "Timeout while looking up postcode"
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
        fetchCoordinatesFromPostcodesIo(postcode),
        10000,
        "Timeout while looking up postcode"
      );
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
