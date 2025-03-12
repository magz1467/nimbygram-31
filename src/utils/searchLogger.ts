
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple function to log search terms to Supabase
 */
export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    // Check if the table exists first before attempting to log
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'Searches');
      
    // If the Searches table doesn't exist, create it or log silently
    if (tableError || !tables || tables.length === 0) {
      console.log('Search logging table not found, will log to console instead');
      console.log(`Search logged: ${searchTerm} (${type}) from ${tab || 'unknown'} tab`);
      return;
    }
    
    // Try to insert search data
    await supabase.from('Searches').insert({
      search_term: searchTerm,
      search_type: type,
      tab: tab || null,
      user_logged_in: true
    });
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
  }
};
