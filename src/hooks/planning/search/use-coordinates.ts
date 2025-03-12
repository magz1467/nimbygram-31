
import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { 
  fetchCoordinatesFromPostcodesIo,
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesByLocationName
} from '@/services/coordinates';
import { detectLocationType } from '@/services/coordinates/location-type-detector';

interface CoordinatesState {
  coordinates: [number, number] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCoordinates(searchTerm: string): CoordinatesState {
  const [state, setState] = useState<CoordinatesState>({
    coordinates: null,
    isLoading: false,
    error: null
  });
  
  const searchTermRef = useRef(searchTerm);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);
  
  useEffect(() => {
    if (!searchTerm) {
      setState({
        coordinates: null,
        isLoading: false,
        error: null
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    
    const debouncedFetch = debounce(async () => {
      try {
        const locationType = detectLocationType(searchTerm);
        let coordinates: [number, number];
        
        switch (locationType) {
          case 'POSTCODE':
            coordinates = await fetchCoordinatesFromPostcodesIo(searchTerm);
            break;
          case 'PLACE_ID':
            coordinates = await fetchCoordinatesFromPlaceId(searchTerm);
            break;
          case 'LOCATION_NAME':
            coordinates = await fetchCoordinatesByLocationName(searchTerm);
            break;
          default:
            throw new Error('Invalid location type');
        }
        
        if (searchTermRef.current === searchTerm) {
          setState({
            coordinates,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        
        if (searchTermRef.current === searchTerm) {
          setState({
            coordinates: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }
    }, 300);
    
    debouncedFetch();
    
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]);
  
  return state;
}
