
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
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        
        if (isMounted && data.status === 200) {
          setCoordinates([data.result.latitude, data.result.longitude]);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        if (isMounted) {
          // Add a small delay to ensure smooth loading state
          setTimeout(() => {
            setIsLoading(false);
          }, 1500);
        }
      }
    };

    fetchCoordinates();
    
    // Reset coordinates when postcode changes
    if (!postcode) {
      setCoordinates(null);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [postcode]);

  return { coordinates, isLoading };
};
