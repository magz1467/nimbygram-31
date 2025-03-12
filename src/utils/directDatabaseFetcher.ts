
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './errors/centralized-handler';

/**
 * Direct database fetcher using Supabase client
 */
export async function fetchDirectFromDatabase(table: string, query: any) {
  try {
    let builder = supabase.from(table).select('*');
    
    // Apply query parameters if provided
    if (query.limit) builder = builder.limit(query.limit);
    if (query.offset) builder = builder.range(query.offset, query.offset + (query.limit || 10) - 1);
    if (query.orderBy) builder = builder.order(query.orderBy.column, { ascending: query.orderBy.ascending });
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        builder = builder.eq(key, value);
      });
    }
    
    const { data, error } = await builder;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    handleError(error, { context: 'directDatabaseFetcher' });
    return { data: null, error };
  }
}
