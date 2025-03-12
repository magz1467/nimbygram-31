
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple function to log search terms to Supabase
 * Fall back gracefully if the Searches table doesn't exist
 */
export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    console.log(`Logging search: ${searchTerm} (${type}) from ${tab || 'unknown'} tab`);
    
    // Since we're getting errors with the Searches table, 
    // we'll just log to console for now and not try to access the table
    // This prevents unnecessary 400 errors that might cause page reloads
    
    // For future implementation when the table exists:
    // await supabase.from('Searches').insert({
    //   search_term: searchTerm,
    //   search_type: type,
    //   tab: tab || null,
    //   user_logged_in: true
    // });
    
    return true;
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
};
