import { directusApi } from "@/integrations/directus/api";
import { Application } from "@/types/planning";
import { transformApplicationData } from './transformApplicationData';

/**
 * Fetches planning applications from an edge function
 */
export const fetchApplicationsViaFunction = async (params: any): Promise<any> => {
  try {
    const response = await directusApi.get('/items/applications', {
      params: {
        ...params,
        fields: '*'
      }
    });

    if (!response.ok) {
      console.error('Edge function error:', response.status, response.statusText);
      throw new Error(`Edge function failed with status ${response.status}`);
    }

    const rawData = await response.data;

    // Process applications data
    const transformedApplications = rawData
      ?.map(app => transformApplicationData(app))
      .filter(Boolean);

    return {
      applications: transformedApplications || [],
      totalCount: rawData?.length || 0,
      rawData: rawData
    };

  } catch (error: any) {
    console.error('Error fetching applications via function:', error);
    throw error;
  }
};
