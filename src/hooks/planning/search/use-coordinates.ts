
import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { 
  fetchCoordinatesFromPostcodeIo, 
  fetchCoordinatesFromPlaceId, 
  fetchCoordinatesByLocationName 
} from '@/services/coordinates';
import { detectLocationType } from '@/services/coordinates/location-type-detector';

// Define the return type for the hook
interface CoordinatesState {
  coordinates: [number, number] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to convert a search term into coordinates
 * Uses debouncing to prevent excessive API calls
 */
export function useCoordinates(searchTerm: string): CoordinatesState {
  // Use a single state object to prevent partial updates
  const [state, setState] = useState<CoordinatesState>({
    coordinates: null,
    isLoading: false,
    error: null
  });
  
  // Use a ref to track the current search term
  const searchTermRef = useRef(searchTerm);
  
  // Update the ref when the search term changes
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);
  
  // Fetch coordinates when search term changes
  useEffect(() => {
    if (!searchTerm) {
      // Reset state if search term is empty
      setState({
        coordinates: null,
        isLoading: false,
        error: null
      });
      return;
    }
    
    // Set loading state immediately
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    
    // Create a debounced function to fetch coordinates
    const debouncedFetch = debounce(async () => {
      try {
        // Determine the type of the search term
        const locationType = detectLocationType(searchTerm);
        
        let coordinates: [number, number] | null = null;
        
        // Use the appropriate fetcher based on the location type
        if (locationType === 'UK_POSTCODE') {
          coordinates = await fetchCoordinatesFromPostcodeIo(searchTerm);
        } else if (locationType === 'PLACE_ID') {
          coordinates = await fetchCoordinatesFromPlaceId(searchTerm);
        } else {
          coordinates = await fetchCoordinatesByLocationName(searchTerm);
        }
        
        // Only update state if search term hasn't changed
        if (searchTermRef.current === searchTerm) {
          setState({
            coordinates,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        
        // Only update state if search term hasn't changed
        if (searchTermRef.current === searchTerm) {
          setState({
            coordinates: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }
    }, 300); // 300ms debounce time
    
    debouncedFetch();
    
    // Clean up debounced function
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]);
  
  return state;
}
