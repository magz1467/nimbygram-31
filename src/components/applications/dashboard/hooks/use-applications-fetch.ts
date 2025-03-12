
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { handleError } from '@/utils/errors/centralized-handler';

export interface FetchApplicationsParams {
  center?: [number, number];
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  totalCount: number;
}

// Transform application data to ensure proper format
export function transformApplicationData(applications: any[]): Application[] {
  return applications.map(app => ({
    id: app.id,
    title: app.title || app.ai_title || 'Unknown Application',
    address: app.address || 'No address provided',
    status: app.status || 'Unknown',
    description: app.description || '',
    reference: app.reference || app.external_id || '',
    coordinates: app.lat && app.lng ? [app.lat, app.lng] : undefined,
    distance: app.distance ? `${Math.round(app.distance)}m` : undefined,
    submissionDate: app.received_date || app.valid_date || app.date_received, 
    submittedDate: app.received_date || app.valid_date,
    decisionDue: app.decision_target_date || app.decision_due,
    type: app.application_type || app.type,
    ward: app.ward,
    consultationEnd: app.last_date_consultation_comments,
    impact_score: app.impact_score
  }));
}

export async function fetchApplicationsInRadius({
  center,
  radius = 1000,
  page = 0,
  pageSize = 100
}: FetchApplicationsParams): Promise<ApplicationsResponse> {
  if (!center) {
    return { applications: [], totalCount: 0 };
  }

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
      return {
        applications: [],
        totalCount: 0
      };
    }

    const transformedApplications = transformApplicationData(data);

    return {
      applications: transformedApplications,
      totalCount: transformedApplications.length
    };
  } catch (error) {
    handleError(error, { context: 'fetchApplicationsInRadius' });
    throw error;
  }
}
