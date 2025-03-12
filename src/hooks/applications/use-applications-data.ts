
import { useState } from 'react';
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { fetchApplicationsInRadius } from './applications/use-applications-fetch';
import { transformApplicationData } from '@/utils/transformApplicationData';

export interface ApplicationError {
  message: string;
  details?: string;
}

export interface StatusCounts {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
}

export const calculateStatusCounts = (applications: Application[]): StatusCounts => {
  return applications.reduce((counts: StatusCounts, app) => {
    const status = app.status || 'Other';
    const category = status.includes('Under Review') ? 'Under Review' :
                   status.includes('Approved') ? 'Approved' :
                   status.includes('Declined') ? 'Declined' : 'Other';
    counts[category as keyof StatusCounts] = (counts[category as keyof StatusCounts] || 0) + 1;
    return counts;
  }, { 'Under Review': 0, 'Approved': 0, 'Declined': 0, 'Other': 0 });
};

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
