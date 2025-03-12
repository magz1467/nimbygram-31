
import { useState, useEffect } from 'react';
import { 
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesByLocationName,
  fetchCoordinatesFromPostcodesIo,
  detectLocationType,
  extractPlaceName
} from '@/services/coordinates';
import { useToast } from '@/hooks/use-toast';

// Helper function to implement timeout for promises
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]) as Promise<T>;
};

export const useCoordinates = (searchTerm: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
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
      
      console.log('🔍 useCoordinates: Fetching coordinates for:', searchTerm);
      
      try {
        // Determine what type of location string we have
        const locationType = detectLocationType(searchTerm);
        
        // Choose the right method based on what we're dealing with
        switch (locationType) {
          case 'PLACE_ID':
            console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
            const placeCoords = await withTimeout(
              fetchCoordinatesFromPlaceId(searchTerm),
              10000,
              "Timeout while retrieving location details"
            );
            if (isMounted) setCoordinates(placeCoords);
            break;
            
          case 'LOCATION_NAME':
            console.log('🏙️ Detected location name:', searchTerm);
            
            try {
              // First try with the full search term
              console.log('🔍 Searching for exact location name:', searchTerm);
              const locationCoords = await withTimeout(
                fetchCoordinatesByLocationName(searchTerm),
                10000,
                "Timeout while searching for location"
              );
              
              if (isMounted && locationCoords) {
                console.log('✅ Found coordinates for location:', locationCoords);
                setCoordinates(locationCoords);
              }
            } catch (locationError) {
              console.warn('⚠️ Location search failed:', locationError.message);
              
              // Extract simplified place name as fallback
              const placeName = extractPlaceName(searchTerm);
              if (placeName && placeName !== searchTerm) {
                try {
                  console.log('🔍 Trying with simplified place name:', placeName);
                  const fallbackCoords = await withTimeout(
                    fetchCoordinatesByLocationName(placeName),
                    10000,
                    "Timeout while searching for simplified location"
                  );
                  
                  if (isMounted && fallbackCoords) {
                    console.log('✅ Found coordinates for simplified location:', fallbackCoords);
                    setCoordinates(fallbackCoords);
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
            const postcodeCoords = await withTimeout(
              fetchCoordinatesFromPostcodesIo(searchTerm),
              10000,
              "Timeout while looking up postcode"
            );
            if (isMounted) setCoordinates(postcodeCoords);
            break;
        }
      } catch (error) {
        console.error("❌ useCoordinates: Error fetching coordinates:", error.message);
        
        // Show user-friendly error toast
        toast({
          title: "Location Error",
          description: `We couldn't find the location "${searchTerm}". Please try a more specific UK location or postcode.`,
          variant: "destructive",
        });
        
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
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
    };
  }, [searchTerm, toast]);

  return { coordinates, isLoading, error };
};
