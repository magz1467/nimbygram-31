
import { supabase } from "@/integrations/supabase/client";

export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    const { data, error } = await supabase.from('Searches').insert({
      'Post Code': searchTerm,
      'Location': searchTerm, // Add Location field
      'User_logged_in': true,
      'Type': type,
      'Tab': tab
    });

    if (error) {
      console.error('Error logging search:', error);
    }

    return data;
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
    return null;
  }
};
