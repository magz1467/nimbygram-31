
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

// Define a function to transform the raw application data into our Application type
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
  console.log('🔍 Starting fetch with params:', { center, radius, page, pageSize });

  try {
    const { data, error } = await supabase
      .rpc('get_nearby_applications', {
        center_lng: center[1],
        center_lat: center[0],
        radius_meters: radius,
        page_size: pageSize,
        page_number: page
      });

    if (error) {
      handleError(error, { context: 'fetchApplicationsInRadius' });
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No applications found');
      return {
        applications: [],
        totalCount: 0,
        rawData: null
      };
    }

    const transformedApplications = data
      .map(app => transformApplicationData(app, center))
      .filter((app): app is Application => app !== null);

    console.log(`Found ${transformedApplications.length} applications`);

    return {
      applications: transformedApplications,
      totalCount: transformedApplications.length,
      rawData: data
    };
  } catch (error) {
    handleError(error, { context: 'fetchApplicationsInRadius' });
    throw error;
  }
};
