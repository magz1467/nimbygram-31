import { useEffect } from 'react';
import { useMapViewStore } from '../store/mapViewStore';
import { fetchApplications } from '../api/applications'; // Correct this path

export function useApplicationData(postcode: string | null) {
  const { applications, setApplications } = useMapViewStore();
  
  useEffect(() => {
    async function loadApplications() {
      if (postcode) {
        try {
          const data = await fetchApplications(postcode);
          setApplications(data);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
        }
      }
    }
    
    loadApplications();
  }, [postcode, setApplications]);
  
  return { applications };
} 