
import { useState, useEffect } from 'react';
import { detectLocationType } from '@/services/coordinates';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCoordinatesForPlaceId,
  fetchCoordinatesForLocationName,
  fetchCoordinatesForPostcode,
  fetchCoordinatesForOutcode,
  fetchCoordinatesForTown,
  fetchCoordinatesForAddress,
  CoordinateCallbacks
} from './coordinates/fetch-strategies';
import { handleCoordinateError } from './coordinates/error-handler';

interface CoordinatesOptions {
  isLocationName?: boolean;
}

export const useCoordinates = (searchTerm: string | undefined, options: CoordinatesOptions = {}) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [postcode, setPostcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!searchTerm) {
        console.log('❌ useCoordinates: No search term provided');
        return;
      }
      
      // Reset state on new request
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      setPostcode(null);
      
      console.log('🔍 useCoordinates: Fetching coordinates for:', searchTerm);
      console.log('🔍 useCoordinates: Is location name?', options.isLocationName);
      
      try {
        // For explicitly marked location names, prefer direct location name search
        let locationType = options.isLocationName ? 'LOCATION_NAME' : detectLocationType(searchTerm);
        console.log(`🔍 useCoordinates: Using location type: ${locationType}`);
        
        // Callbacks object to pass to strategy functions
        const callbacks = {
          setCoordinates: (coords: [number, number]) => {
            if (isMounted) setCoordinates(coords);
          },
          setPostcode: (pc: string | null) => {
            if (isMounted) setPostcode(pc);
          }
        };
        
        // Choose the right method based on what we're dealing with
        switch (locationType) {
          case 'PLACE_ID':
            await fetchCoordinatesForPlaceId(searchTerm, isMounted, callbacks);
            break;
            
          case 'TOWN':
            await fetchCoordinatesForTown(searchTerm, isMounted, callbacks);
            break;
            
          case 'OUTCODE':
            await fetchCoordinatesForOutcode(searchTerm, isMounted, callbacks);
            break;
            
          case 'ADDRESS':
            await fetchCoordinatesForAddress(searchTerm, isMounted, callbacks);
            break;
            
          case 'LOCATION_NAME':
            await fetchCoordinatesForLocationName(searchTerm, isMounted, callbacks);
            break;
            
          case 'POSTCODE':
            await fetchCoordinatesForPostcode(searchTerm, isMounted, callbacks);
            break;
        }
      } catch (error: any) {
        handleCoordinateError(error, searchTerm, toast);
        
        if (isMounted) {
          setError(error instanceof Error ? error : new Error(String(error)));
          setCoordinates(null);
        }
      } finally {
        if (isMounted) {
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
        }
      }
    };

    if (searchTerm && searchTerm.trim()) {
      console.log('🔄 useCoordinates: Search term changed, fetching new coordinates:', searchTerm);
      fetchCoordinates();
    } else {
      setCoordinates(null);
      setPostcode(null);
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
    };
  }, [searchTerm, options.isLocationName, toast]);

  return { coordinates, postcode, isLoading, error };
};
