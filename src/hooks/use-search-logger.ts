
import { supabase } from "@/integrations/supabase/client";

type SearchStatus = 'recent' | 'completed';

export const useSearchLogger = () => {
  const logSearch = async (postcode: string, status: SearchStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to console for debugging
      console.log(`Logging search: ${postcode} with status: ${status}`);
      
      // Use 'Post Code' instead of 'search_term' as that's the actual column name
      const { error } = await supabase
        .from('Searches')
        .insert({
          'Post Code': postcode,  // This is the correct column name
          'Status': status,
          'User_logged_in': !!session?.user
        });

      if (error) {
        console.error('Error logging search:', error);
      }
    } catch (err) {
      // More detailed error logging for debugging
      console.error('Error logging search:', err);
    }
  };

  return { logSearch };
};
