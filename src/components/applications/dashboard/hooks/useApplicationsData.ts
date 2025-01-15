import { useState } from 'react';
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationData } from '@/utils/applicationTransforms';
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
  const [statusCounts, setStatusCounts] = useState({
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
    console.log('🔍 Fetching applications:', { center, radius, page, pageSize });

    try {
      const { data: applications, error } = await supabase
        .rpc('get_applications_within_radius', {
          center_lng: center[1],
          center_lat: center[0],
          radius_meters: radius,
          page_size: pageSize,
          page_number: page
        });

      if (error) {
        console.error('Error fetching applications:', error);
        setError({
          message: 'Error fetching applications',
          details: error.message
        });
        setApplications([]);
        setTotalCount(0);
        return;
      }

      if (!applications || !Array.isArray(applications)) {
        console.log('No applications found');
        setApplications([]);
        setTotalCount(0);
        return;
      }

      console.log(`📦 Raw applications data:`, applications.map(app => ({
        id: app.id,
        class_3: app.class_3,
        title: app.title
      })));

      const transformedApplications = applications
        ?.map(app => transformApplicationData(app, center))
        .filter((app): app is Application => app !== null);

      console.log('✨ Transformed applications:', transformedApplications.map(app => ({
        id: app.id,
        class_3: app.class_3,
        title: app.title
      })));

      setApplications(transformedApplications || []);

      // Calculate status counts
      const counts = {
        'Under Review': 0,
        'Approved': 0,
        'Declined': 0,
        'Other': 0
      };

      transformedApplications.forEach(app => {
        const status = app.status.toLowerCase();
        if (status.includes('under consideration')) {
          counts['Under Review']++;
        } else if (status.includes('approved')) {
          counts['Approved']++;
        } else if (status.includes('declined')) {
          counts['Declined']++;
        } else {
          counts['Other']++;
        }
      });

      setStatusCounts(counts);

      // Get total count
      const { data: countData, error: countError } = await supabase
        .rpc('get_applications_count_within_radius', {
          center_lng: center[1],
          center_lat: center[0],
          radius_meters: radius
        });

      if (countError) {
        console.error('Error fetching count:', countError);
        setTotalCount(0);
      } else {
        setTotalCount(countData || 0);
      }

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      setError({
        message: 'Failed to fetch applications',
        details: error.message
      });
      // Show more detailed error information
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
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
    fetchApplicationsInRadius,
  };
};