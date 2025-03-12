import { useState } from 'react';
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { fetchApplicationsInRadius } from './applications/use-applications-fetch';
import { calculateStatusCounts, StatusCounts } from './applications/use-status-counts';

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
      console.log('📊 Status counts:', statusCounts);

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      setError({
        message: 'Failed to fetch applications',
        details: error.message
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Fetch completed');
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