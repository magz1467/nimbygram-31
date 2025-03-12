
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { fetchApplicationsInRadius } from './use-applications-fetch';
import { StatusCounts } from '@/types/application-types';

interface UseApplicationsDataProps {
  postcode?: string;
  radius?: number;
}

export const useApplicationsData = ({ postcode, radius = 5 }: UseApplicationsDataProps = {}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!postcode) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch coordinates
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        
        if (!data.result) {
          throw new Error('Invalid postcode');
        }
        
        const coords: [number, number] = [data.result.latitude, data.result.longitude];
        setCoordinates(coords);
        
        // Fetch applications
        const apps = await fetchApplicationsInRadius(coords, radius);
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postcode, radius]);

  // Sort applications by received_date
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
    const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
    return dateB - dateA;
  });

  return {
    applications: sortedApplications,
    isLoading,
    error,
    coordinates
  };
};
