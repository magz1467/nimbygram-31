
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { transformApplicationData } from '@/utils/transformApplicationData';
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
    return {
      applications: [],
      totalCount: 0,
      rawData: null
    };
  }

  const { applications: appsData, total_count } = data[0];

  console.log(`📦 Raw applications data:`, appsData?.map(app => ({
    id: app.id,
    title: app.title,
    final_impact_score: app.final_impact_score
  })));

  const transformedApplications = appsData
    ?.map(app => transformApplicationData(app))
    .filter((app): app is Application => app !== null);

  console.log('✨ Transformed applications:', transformedApplications?.map(app => ({
    id: app.id,
    title: app.title,
    final_impact_score: app.impact_score
  })));

  // Verify sorting
  console.log('🔄 Verifying impact score ordering:', transformedApplications?.map(app => ({
    id: app.id,
    final_impact_score: app.impact_score
  })));

  return {
    applications: transformedApplications || [],
    totalCount: total_count || 0,
    rawData: data[0]
  };
};
