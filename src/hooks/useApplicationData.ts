
import { useEffect, useState } from 'react';
import { useMapViewStore } from '../store/mapViewStore';
import { fetchApplications } from '../api/applications';

export function useApplicationData(postcode: string | null) {
  const { applications, setApplications } = useMapViewStore();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function loadApplications() {
      if (postcode) {
        try {
          setIsLoading(true);
          const data = await fetchApplications(postcode);
          setApplications(data);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadApplications();
  }, [postcode, setApplications]);
  
  return { applications, isLoading };
}
