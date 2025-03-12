import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { fetchApplicationsInArea } from './use-applications-fetch';
import { ErrorType } from '@/utils/errors/types';
import { createAppError } from '@/utils/errors/error-factory';

export function useApplicationsData(
  coordinates: [number, number] | null,
  radius: number = 1,
  filters: Record<string, string> = {}
) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasResults, setHasResults] = useState<boolean>(false);

  useEffect(() => {
    if (!coordinates) {
      setApplications([]);
      setError(null);
      setHasResults(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch applications in the specified area
        const [lat, lng] = coordinates;
        console.log(`Fetching applications: lat=${lat}, lng=${lng}, radius=${radius}km`);
        
        const results = await fetchApplicationsInArea(lat, lng, radius, filters);
        
        if (results && Array.isArray(results)) {
          console.log(`Found ${results.length} applications`);
          setApplications(results);
          setHasResults(results.length > 0);
        } else {
          console.log('No applications found or invalid response');
          setApplications([]);
          setHasResults(false);
        }
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        
        // Create a proper error object
        const appError = createAppError(
          err?.message || 'Error fetching planning applications',
          err,
          { type: err?.type || ErrorType.UNKNOWN }
        );
        
        setError(appError);
        
        // Keep any previous results if we have them
        if (!applications.length) {
          setHasResults(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [coordinates, radius, JSON.stringify(filters)]);

  return {
    applications,
    isLoading,
    error,
    hasResults
  };
}
