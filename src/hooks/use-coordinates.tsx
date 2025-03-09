
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
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]) as Promise<T>;
};

export const useCoordinates = (postcode: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!postcode) {
        console.log('❌ useCoordinates: No postcode provided');
        return;
      }
      
      // Reset state on new request
      setIsLoading(true);
      setError(null);
      setCoordinates(null);
      
      console.log('🔍 useCoordinates: Fetching coordinates for:', postcode);
      
      try {
        // Determine what type of location string we have
        const locationType = detectLocationType(postcode);
        
        // Choose the right method based on what we're dealing with
        switch (locationType) {
          case 'PLACE_ID':
            console.log('🌍 Detected Google Place ID, using Maps API to get coordinates');
            const placeCoords = await withTimeout(
              fetchCoordinatesFromPlaceId(postcode),
              10000,
              "Timeout while retrieving location details"
            );
            if (isMounted) setCoordinates(placeCoords);
            break;
            
          case 'LOCATION_NAME':
            console.log('🏙️ Detected location name:', postcode);
            
            // For location names, try the direct approach first - the whole string
            try {
              console.log('🔍 Searching for exact location name:', postcode);
              const locationCoords = await withTimeout(
                fetchCoordinatesByLocationName(postcode),
                10000,
                "Timeout while searching for location"
              );
              if (isMounted) setCoordinates(locationCoords);
              return; // Exit if successful
            } catch (directError) {
              console.warn('⚠️ Direct location search failed, trying extracted place name');
              
              // Extract the main location name (before the first comma) as backup
              const placeName = extractPlaceName(postcode);
              if (placeName && placeName !== postcode) {
                console.log('🔍 Searching for extracted place name:', placeName);
                try {
                  const locationCoords = await withTimeout(
                    fetchCoordinatesByLocationName(placeName),
                    10000,
                    "Timeout while searching for simplified location"
                  );
                  if (isMounted) setCoordinates(locationCoords);
                  return; // Exit if successful with extracted name
                } catch (extractedError) {
                  console.error('❌ Both direct and extracted place name searches failed');
                  // Let it fall through to the error handling
                  throw directError; // Throw the original error for better context
                }
              } else {
                throw directError; // Re-throw the original error
              }
            }
            
          case 'POSTCODE':
            // Regular UK postcode - use Postcodes.io
            console.log('📫 Regular postcode detected, using Postcodes.io API');
            const postcodeCoords = await withTimeout(
              fetchCoordinatesFromPostcodesIo(postcode),
              10000,
              "Timeout while looking up postcode"
            );
            if (isMounted) setCoordinates(postcodeCoords);
            break;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ useCoordinates: Error fetching coordinates:", errorMessage);
        
        // Show toast for location errors
        toast({
          title: "Location Error",
          description: `We couldn't find the location "${postcode}". Please try a more specific UK location or postcode.`,
          variant: "destructive",
        });
        
        if (isMounted) {
          setError(error instanceof Error ? error : new Error(String(error)));
          // Important: Reset coordinates when there's an error
          setCoordinates(null);
        }
      } finally {
        if (isMounted) {
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
        }
      }
    };

    if (postcode && postcode.trim()) {
      console.log('🔄 useCoordinates: Postcode changed, fetching new coordinates:', postcode);
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
  }, [postcode, toast]);

  return { coordinates, isLoading, error };
};
