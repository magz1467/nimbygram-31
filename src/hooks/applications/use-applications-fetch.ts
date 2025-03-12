
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { handleError } from '@/utils/errors/centralized-handler';

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

export const transformApplicationData = (app: any, center?: LatLngTuple): Application | null => {
  try {
    if (!app) return null;
    
    // Basic application data transformation
    return {
      id: app.id,
      title: app.title || app.ai_title || 'Unknown Application',
      address: app.address || 'No address provided',
      status: app.status || 'Unknown',
      description: app.description || '',
      reference: app.reference || app.external_id || '',
      coordinates: app.lat && app.lng ? [app.lat, app.lng] : undefined,
      distance: app.distance ? `${Math.round(app.distance)}m` : undefined,
      // Add other required fields from the Application type
    } as Application;
  } catch (error) {
    console.error('Error transforming application data:', error);
    return null;
  }
};

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
      handleError(error, { context: 'fetchApplicationsInRadius' });
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
      class_3: app.class_3,
      title: app.title,
      final_impact_score: app.final_impact_score
    })));

    const transformedApplications = appsData
      ?.map(app => transformApplicationData(app, center))
      .filter((app): app is Application => app !== null);

    console.log('✨ Transformed applications:', transformedApplications?.map(app => ({
      id: app.id,
      title: app.title,
    })));

    return {
      applications: transformedApplications || [],
      totalCount: total_count || 0,
      rawData: data[0]
    };
  } catch (error) {
    handleError(error, { context: 'fetchApplicationsInRadius' });
    throw error;
  }
};
