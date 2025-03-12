
import { useState } from 'react';
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { fetchApplicationsInRadius } from './use-applications-fetch';
import { calculateStatusCounts } from './use-status-counts';
import { StatusCounts } from "@/types/application-types";
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

  const fetchApplications = async (
    center: LatLngTuple,
    radius: number,
    page = 0,
    pageSize = 100
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { applications: fetchedApps, totalCount: count } = 
        await fetchApplicationsInRadius({ center, radius, page, pageSize });
      
      setApplications(fetchedApps);
      setTotalCount(count);
      setStatusCounts(calculateStatusCounts(fetchedApps));

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      
      handleError(error, { context: 'useApplicationsData' });
      
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
    fetchApplicationsInRadius: fetchApplications,
  };
};
