
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from './applicationTransforms';

/**
 * Fetches planning applications from an edge function
 */
export const fetchApplicationsViaFunction = async (params: any): Promise<any> => {
  try {
    // Use Supabase directly since directus/api is not available
    const response = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id', { ascending: false });
      
    if (response.error) {
      console.error('Edge function error:', response.error);
      throw new Error(`Edge function failed: ${response.error.message}`);
    }

    const rawData = response.data;

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
