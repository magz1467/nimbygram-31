
import { useState } from 'react';
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { useApplicationsFetch } from './applications/use-applications-fetch';
import { useStatusCounts } from './applications/use-status-counts';
import { StatusCounts } from '@/types/application-types';
import { handleError } from '@/utils/errors/centralized-handler';

export interface ApplicationError {
  message: string;
  details?: string;
}

export const useApplicationsData = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<ApplicationError | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  });

  const { fetchApplications } = useApplicationsFetch();
  const { fetchStatusCounts } = useStatusCounts();

  const fetchApplicationsData = async (
    center: LatLngTuple,
    radius: number,
    page = 0,
    pageSize = 100
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedApps = await fetchApplications({ 
        limit: pageSize, 
        orderBy: 'received_date' 
      });
      
      setApplications(fetchedApps);
      setTotalCount(fetchedApps.length);
      
      const counts = await fetchStatusCounts();
      setStatusCounts(counts);

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      handleError(error);
      
      setError({
        message: 'Failed to fetch applications',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    totalCount,
    statusCounts,
    error,
    fetchApplicationsInRadius: fetchApplicationsData,
  };
};
