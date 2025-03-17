import { supabase } from "@/integrations/supabase/client";

type SearchStatus = 'recent' | 'completed';

export const useSearchLogger = () => {
  const logSearch = async (postcode: string, status: SearchStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('Searches')
        .insert({
          'Post Code': postcode,
          'Status': status,
          'User_logged_in': !!session?.user
        });

      if (error) {
        console.error('Error logging search:', error);
      }
    } catch (err) {
      console.error('Error logging search:', err);
    }
  };

  return { logSearch };
};