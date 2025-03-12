
import { useState } from 'react';
import { detectLocationType, extractPlaceName } from '@/services/coordinates';
import { fetchCoordinatesFromPlaceId, fetchCoordinatesByLocationName, fetchCoordinatesFromPostcodesIo } from '@/services/coordinates';
import { withRetry } from '@/utils/retry';
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { logCoordinatesOperation, logCoordinatesError } from '@/utils/coordinates/coordinates-logger';

export const useCoordinatesFetch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoordinates = async (searchTerm: string) => {
    if (!searchTerm) {
      logCoordinatesOperation('validation', 'No search term provided');
      return null;
    }

    const locationType = detectLocationType(searchTerm);
    let locationCoords: [number, number] | null = null;

    try {
      switch (locationType) {
        case 'PLACE_ID':
          logCoordinatesOperation('fetch', { type: 'place_id', term: searchTerm });
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
                onRetry: (err, attempt) => logCoordinatesOperation('retry', { attempt, error: err })
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
          logCoordinatesOperation('fetch', { type: 'location_name', term: searchTerm });
          try {
            locationCoords = await fetchLocationByName(searchTerm);
          } catch (locationError) {
            const placeName = extractPlaceName(searchTerm);
            if (placeName && placeName !== searchTerm) {
              locationCoords = await fetchLocationByName(placeName);
            } else {
              throw locationError;
            }
          }
          break;

        case 'POSTCODE':
          logCoordinatesOperation('fetch', { type: 'postcode', term: searchTerm });
          locationCoords = await fetchPostcodeCoordinates(searchTerm);
          break;
      }

      return locationCoords;
    } catch (error) {
      logCoordinatesError(error, { searchTerm, locationType });
      throw error;
    }
  };

  const fetchLocationByName = async (locationName: string) => {
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
  };

  const fetchPostcodeCoordinates = async (postcode: string) => {
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
  };

  return {
    fetchCoordinates,
    isLoading,
    setIsLoading
  };
};
