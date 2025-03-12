
import { useState } from 'react';
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationData } from '@/utils/applicationTransforms';
import { calculateStatusCounts, type StatusCounts } from './use-status-counts';
import { LatLngTuple } from 'leaflet';

interface ApplicationError {
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

  const fetchApplicationsInRadius = async (
    center: LatLngTuple,
    radius: number,
    page = 0,
    pageSize = 100
  ) => {
    setIsLoading(true);
    setError(null);
    console.log('🔍 Starting fetch with params:', { 
      center, 
      radius, 
      page, 
      pageSize,
      timestamp: new Date().toISOString()
    });

    try {
      const { data: rawData, error: queryError } = await supabase
        .from('crystal_roof')
        .select('*')
        .order('id');

      if (queryError) {
        console.error('Error fetching applications:', queryError);
        throw queryError;
      }

      const transformedApplications = rawData
        .map(app => transformApplicationData(app, center))
        .filter((app): app is Application => app !== null);

      console.log('✨ Transformed applications:', {
        total: transformedApplications?.length,
        withStorybook: transformedApplications?.filter(app => app.storybook)?.length,
        sampleStorybook: transformedApplications?.[0]?.storybook
      });

      setApplications(transformedApplications || []);
      setTotalCount(transformedApplications.length || 0);
      setStatusCounts(calculateStatusCounts(transformedApplications));

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
    fetchApplicationsInRadius,
  };
};
