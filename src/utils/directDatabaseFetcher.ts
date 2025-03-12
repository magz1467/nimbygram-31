
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from './applicationTransforms';

/**
 * Fetches planning applications directly from the database
 */
export const fetchApplicationsViaDatabase = async (params: any): Promise<any> => {
  try {
    const response = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id', { ascending: false });

    if (response.error) {
      console.error('Database error:', response.error);
      throw response.error;
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
    console.error('Error fetching applications via database:', error);
    throw error;
  }
};
