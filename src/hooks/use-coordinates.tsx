
import { useState, useEffect } from 'react';
import { LatLngTuple } from "leaflet";

export const useCoordinates = (postcode: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!postcode) {
        console.log('❌ useCoordinates: No postcode provided');
        return;
      }
      
      setIsLoading(true);
      console.log('🔍 useCoordinates: Fetching coordinates for postcode:', postcode);
      
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        
        console.log('📍 useCoordinates: API response:', data);
        
        if (isMounted && data.status === 200) {
          const newCoordinates: [number, number] = [data.result.latitude, data.result.longitude];
          console.log('✅ useCoordinates: Setting coordinates:', newCoordinates);
          setCoordinates(newCoordinates);
        }
      } catch (error) {
        console.error("❌ useCoordinates: Error fetching coordinates:", error);
        setCoordinates(null);
      } finally {
        if (isMounted) {
          console.log('🏁 useCoordinates: Finished loading');
          setIsLoading(false);
        }
      }
    };

    fetchCoordinates();
    
    return () => {
      console.log('🔇 useCoordinates: Cleanup');
      isMounted = false;
    };
  }, [postcode]);

  return { coordinates, isLoading };
};
