
import { handleError } from '@/utils/errors/centralized-handler';
import { supabase } from '@/integrations/supabase/client';

export async function directDatabaseFetcher<T = any>(query: string, params?: any): Promise<T> {
  try {
    // For simple queries directly against tables
    if (query.startsWith('select')) {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: query,
        query_params: params ? JSON.stringify(params) : '{}'
      });
      
      if (error) throw error;
      return data as T;
    }
    
    // For function calls
    const { data, error } = await supabase.rpc(query, params || {});
    
    if (error) throw error;
    return data as T;
  } catch (error) {
    handleError(error, { context: 'directDatabaseFetcher' });
    throw error;
  }
}
