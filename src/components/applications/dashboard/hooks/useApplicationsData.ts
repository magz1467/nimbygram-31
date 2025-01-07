import { useState } from 'react';
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { LatLngTuple } from 'leaflet';
import { useToast } from '@/hooks/use-toast';
import { transformApplicationData } from '@/utils/applicationTransforms';

interface StatusCounts {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
}

export const useApplicationsData = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchPoint, setSearchPoint] = useState<LatLngTuple | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  });
  const { toast } = useToast();

  const fetchApplicationsInRadius = async (
    center: LatLngTuple,
    radius: number,
    page = 0,
    pageSize = 100
  ) => {
    setIsLoading(true);
    console.log('🔍 Fetching applications:', { center, radius, page, pageSize });

    try {
      // First get the total count
      const countResponse = await supabase
        .rpc('get_applications_count_within_radius', {
          center_lng: center[1],
          center_lat: center[0],
          radius_meters: radius
        });

      if (countResponse.error) {
        console.error('Error fetching count:', countResponse.error);
        toast({
          title: "Error fetching count",
          description: countResponse.error.message,
          variant: "destructive",
        });
        setTotalCount(0);
      } else {
        setTotalCount(countResponse.data || 0);
      }

      // Then get the applications
      const appsResponse = await supabase
        .rpc('get_applications_within_radius', {
          center_lng: center[1],
          center_lat: center[0],
          radius_meters: radius,
          page_size: pageSize,
          page_number: page
        });

      if (appsResponse.error) {
        console.error('Error fetching applications:', appsResponse.error);
        toast({
          title: "Error fetching applications",
          description: appsResponse.error.message,
          variant: "destructive",
        });
        setApplications([]);
        setTotalCount(0);
        return;
      }

      const apps = appsResponse.data;
      
      if (!apps || !Array.isArray(apps)) {
        console.log('No applications found');
        setApplications([]);
        setTotalCount(0);
        return;
      }

      console.log(`📦 Received ${apps.length} applications from database`);

      const transformedApplications = apps
        .map(app => transformApplicationData(app, center))
        .filter((app): app is Application => app !== null);

      console.log('✨ Transformed applications:', transformedApplications.length);

      const counts: StatusCounts = {
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

      setApplications(transformedApplications);
      setStatusCounts(counts);

    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: "Error fetching applications",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    totalCount,
    searchPoint,
    setSearchPoint,
    statusCounts,
    fetchApplicationsInRadius,
  };
};