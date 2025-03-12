
import { useState } from 'react';
import { detectLocationType } from '@/services/coordinates';
import { logCoordinatesOperation, logCoordinatesError } from '@/utils/coordinates/coordinates-logger';
import { usePlaceIdFetch } from './fetchers/use-place-id-fetch';
import { useLocationNameFetch } from './fetchers/use-location-name-fetch';
import { usePostcodeFetch } from './fetchers/use-postcode-fetch';

export const useCoordinatesFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const placeIdFetcher = usePlaceIdFetch();
  const locationNameFetcher = useLocationNameFetch();
  const postcodeFetcher = usePostcodeFetch();

  const fetchCoordinates = async (searchTerm: string) => {
    if (!searchTerm) {
      logCoordinatesOperation('validation', 'No search term provided');
      return null;
    }

    const locationType = detectLocationType(searchTerm);
    setIsLoading(true);
    
    try {
      switch (locationType) {
        case 'PLACE_ID':
          return await placeIdFetcher.fetchCoordinates(searchTerm);
        
        case 'LOCATION_NAME':
          return await locationNameFetcher.fetchCoordinates(searchTerm);
        
        case 'POSTCODE':
          return await postcodeFetcher.fetchCoordinates(searchTerm);
        
        default:
          throw new Error(`Unsupported location type: ${locationType}`);
      }
    } catch (error) {
      logCoordinatesError(error, { searchTerm, locationType });
      throw error;
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
