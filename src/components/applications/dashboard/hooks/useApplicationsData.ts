
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { useApplicationsFetch } from './use-applications-fetch';
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
  
  const { fetchApplications, fetchCoordinates } = useApplicationsFetch();

  useEffect(() => {
    if (!postcode) return;

    const fetchCoordinatesAndApplications = async () => {
      setIsLoading(true);
      try {
        // Get coordinates for the postcode
        const coords = await fetchCoordinates(postcode);
        if (coords) {
          setCoordinates(coords);
          // Fetch applications using coordinates
          const apps = await fetchApplications(coords, radius);
          setApplications(apps);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinatesAndApplications();
  }, [postcode, radius, fetchApplications, fetchCoordinates]);

  // Sort applications by received_date (most recent first)
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
