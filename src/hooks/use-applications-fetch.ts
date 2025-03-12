import { useState } from 'react';
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationData } from '@/utils/applicationTransforms';
import { LatLngTuple } from 'leaflet';

export const useApplicationsFetch = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplicationsInRadius = async (
    center: LatLngTuple,
    radius: number,
    page = 0,
    pageSize = 100
  ) => {
    setIsLoading(true);
    console.log('🔍 Fetching applications:', { center, radius, page, pageSize });

    try {
      const { data, error } = await supabase
        .rpc('get_applications_with_counts_optimized', {
          center_lng: center[1],
          center_lat: center[0],
          radius_meters: radius,
          page_size: pageSize,
          page_number: page
        });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      if (!data || !data[0]) {
        console.log('No applications found');
        setApplications([]);
        setTotalCount(0);
        return;
      }

      const { applications: appsData, total_count } = data[0];

      console.log(`📦 Raw applications data:`, appsData?.map(app => ({
        id: app.id,
        class_3: app.class_3,
        title: app.title
      })));

      const transformedApplications = appsData
        ?.map(app => transformApplicationData(app, center))
        .filter((app): app is Application => app !== null);

      console.log('✨ Transformed applications:', transformedApplications?.map(app => ({
        id: app.id,
        class_3: app.class_3,
        title: app.title
      })));

      setApplications(transformedApplications || []);
      setTotalCount(total_count || 0);

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
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
    fetchApplicationsInRadius,
  };
};