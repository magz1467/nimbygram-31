
import { useEffect, useState } from 'react';
import { useMapViewStore } from '../store/mapViewStore';
import { fetchApplications } from '../api/applications';
import { Application } from '@/types/planning';

export function useApplicationData(postcode: string | null) {
  const { applications: storeApps, setApplications } = useMapViewStore();
  const [applications, setLocalApplications] = useState<Application[]>(storeApps || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function loadApplications() {
      if (postcode) {
        setIsLoading(true);
        try {
          const data = await fetchApplications(postcode);
          setApplications(data);
          setLocalApplications(data);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
          setError(error instanceof Error ? error : new Error('Failed to fetch applications'));
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadApplications();
  }, [postcode, setApplications]);
  
  return { 
    applications,
    isLoading,
    error
  };
}
