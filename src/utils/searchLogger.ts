
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple function to log search terms to Supabase
 */
export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    await supabase.from('Searches').insert({
      'Post Code': searchTerm,
      'User_logged_in': true,
      'Type': type,
      'Tab': tab
    });
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
  }
};
