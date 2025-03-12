
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationData } from '@/utils/applicationTransforms';
import { LatLngTuple } from 'leaflet';

export interface FetchApplicationsParams {
  center: LatLngTuple;
  radius: number;
  page?: number;
  pageSize?: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  totalCount: number;
  rawData: any;
}

export const fetchApplicationsInRadius = async ({
  center,
  radius,
  page = 0,
  pageSize = 100
}: FetchApplicationsParams): Promise<ApplicationsResponse> => {
  console.log('🔍 Starting fetch with params:', { 
    center, 
    radius, 
    page, 
    pageSize,
    timestamp: new Date().toISOString()
  });

  try {
    // Query the crystal_roof table directly
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    const transformedApplications = data
      ?.map(app => transformApplicationData(app))
      .filter((app): app is Application => app !== null);

    return {
      applications: transformedApplications || [],
      totalCount: transformedApplications?.length || 0,
      rawData: data
    };
  } catch (error) {
    console.error('Error in fetchApplicationsInRadius:', error);
    throw error;
  }
}
