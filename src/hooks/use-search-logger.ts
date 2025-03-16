
import { supabase } from "@/integrations/supabase/client";

type SearchStatus = 'recent' | 'completed' | 'timeout' | 'error';

export const useSearchLogger = () => {
  const logSearch = async (postcode: string, status: SearchStatus, details?: Record<string, any>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('Searches')
        .insert({
          'Post Code': postcode,
          'Status': status,
          'User_logged_in': !!session?.user,
          'Details': details
        });

      if (error) {
        console.error('Error logging search:', error);
      }
    } catch (err) {
      console.error('Error logging search:', err);
    }
  };
  
  const logSearchError = async (searchTerm: string, errorType: string, errorDetails: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('SearchErrors')
        .insert({
          'search_term': searchTerm,
          'error_type': errorType,
          'error_details': errorDetails,
          'user_id': session?.user?.id || null,
          'created_at': new Date().toISOString()
        });

      if (error) {
        console.error('Error logging search error:', error);
      }
    } catch (err) {
      console.error('Error logging search error:', err);
    }
  };

  return { logSearch, logSearchError };
};
