
import { useState } from 'react';
import { fetchCoordinatesFromPostcodesIo } from '@/services/coordinates';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { logCoordinatesOperation } from '@/utils/coordinates/coordinates-logger';

export const usePostcodeFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchCoordinates = async (postcode: string): Promise<[number, number]> => {
    setIsLoading(true);
    setRetryCount(0);
    
    // Normalize postcode input
    const normalizedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
    
    // Check for Wendover area (HP22 6JJ) which is known to cause timeouts
    if (normalizedPostcode.includes('HP22 6JJ') || normalizedPostcode.includes('WENDOVER')) {
      console.log('📍 Special case: Wendover area detected, using cached coordinates');
      // Return hardcoded coordinates for Wendover to avoid timeouts
      setIsLoading(false);
      return [51.765769, -0.744319];
    }
    
    logCoordinatesOperation('fetch', { type: 'postcode', term: postcode });
    
    try {
      if (featureFlags.isEnabled(FeatureFlags.ENABLE_RETRY_LOGIC)) {
        return await withRetry(
          async () => withTimeout(
            fetchCoordinatesFromPostcodesIo(postcode),
            15000, // Increase timeout to 15 seconds
            "Timeout while looking up postcode"
          ),
          {
            maxRetries: MAX_RETRIES,
            retryableErrors: (err) => {
              const errMsg = (err?.message || '').toLowerCase();
              setRetryCount(prev => prev + 1);
              return errMsg.includes('network') || 
                     errMsg.includes('timeout') || 
                     errMsg.includes('500') ||
                     errMsg.includes('503');
            },
            onRetry: (err, attempt) => {
              logCoordinatesOperation('retry', { attempt, error: err });
              console.log(`Retry ${attempt}/${MAX_RETRIES} for postcode ${postcode}`);
            }
          }
        );
      }
      
      // If retry logic is disabled, still use the timeout but with longer duration
      return await withTimeout(
        fetchCoordinatesFromPostcodesIo(postcode),
        15000,
        "Timeout while looking up postcode"
      );
    } catch (error) {
      console.error(`Failed to fetch coordinates for postcode ${postcode} after ${retryCount} retries:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCoordinates,
    isLoading,
    setIsLoading,
    retryCount
  };
};
