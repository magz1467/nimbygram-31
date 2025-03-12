
import { handleError } from "@/utils/errors/centralized-handler";
import { Database } from '../../supabase/functions/database.types';
import { supabase } from "@/integrations/supabase/client";

export async function fetchFromDatabase(params: any) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .ilike('postcode', `%${params.postcode}%`)
      .limit(params.limit || 100);

    if (error) {
      throw error;
    }

    return data as Database['public']['Tables']['applications']['Row'][];
  } catch (error: any) {
    handleError(error, {
      context: { params }
    });
    throw error;
  }
}
