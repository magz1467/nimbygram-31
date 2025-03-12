
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { fetchApplicationsInRadius } from '@/services/applications/application-service';
import { useGlobalErrorHandler } from '@/hooks/use-global-error-handler';

export function useApplicationsData(coordinates: [number, number] | null, radius: number = 5) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const errorHandler = useGlobalErrorHandler();

  useEffect(() => {
    async function fetchData() {
      if (!coordinates) {
        setApplications([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [lat, lng] = coordinates;
        const apps = await fetchApplicationsInRadius(lat, lng, radius);
        setApplications(apps);
      } catch (err) {
        const appError = errorHandler.handleError(err, {
          context: 'fetching applications data',
          silent: true
        });
        setError(appError);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [coordinates, radius, errorHandler]);

  return { applications, isLoading, error };
}
