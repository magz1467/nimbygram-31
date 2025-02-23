
import { useState, useEffect } from 'react';
import { LatLngTuple } from "leaflet";

export const useCoordinates = (postcode: string | undefined) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!postcode) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching coordinates for postcode:', postcode);
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        
        if (isMounted && data.status === 200) {
          console.log('Received coordinates:', [data.result.latitude, data.result.longitude]);
          setCoordinates([data.result.latitude, data.result.longitude]);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setCoordinates(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCoordinates();
    
    return () => {
      isMounted = false;
    };
  }, [postcode]);

  return { coordinates, isLoading };
};
