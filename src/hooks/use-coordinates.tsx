
import { useState, useEffect } from 'react';

export const useCoordinates = (postcode: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!postcode) {
        console.log('❌ useCoordinates: No postcode provided');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      console.log('🔍 useCoordinates: Fetching coordinates for postcode:', postcode);
      
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
        
        if (!response.ok) {
          throw new Error(`Postcode API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('📍 useCoordinates: API response:', data);
        
        if (isMounted && data.status === 200 && data.result) {
          const newCoordinates: [number, number] = [data.result.latitude, data.result.longitude];
          console.log('✅ useCoordinates: Setting coordinates:', newCoordinates);
          setCoordinates(newCoordinates);
        } else {
          console.error('❌ useCoordinates: Invalid response', data);
          setError(new Error("Invalid response from postcode API"));
          setCoordinates(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ useCoordinates: Error fetching coordinates:", errorMessage);
        setError(error instanceof Error ? error : new Error(String(error)));
        setCoordinates(null);
      } finally {
        if (isMounted) {
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
        }
      }
    };

    if (postcode && postcode.trim()) {
      console.log('🔄 useCoordinates: Postcode changed, fetching new coordinates:', postcode);
      setCoordinates(null); // Reset coordinates when postcode changes
      fetchCoordinates();
    } else {
      setCoordinates(null);
      setIsLoading(false);
    }
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
    };
  }, [postcode]);

  return { coordinates, isLoading, error };
};
