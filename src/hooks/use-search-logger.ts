
import { supabase } from "@/integrations/supabase/client";

type SearchStatus = 'recent' | 'completed';

export const useSearchLogger = () => {
  const logSearch = async (postcode: string, status: SearchStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to console for debugging
      console.log(`Logging search: ${postcode} with status: ${status}`);
      console.log('Current hostname:', window.location.hostname);
      
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
        console.error('Error details:', error.details, error.hint, error.message);
        
        // Handle case where column names might be different in production
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('Attempting fallback with different column names...');
          
          // Try with snake_case column names as fallback
          const { error: fallbackError } = await supabase
            .from('Searches')
            .insert({
              'search_term': postcode,
              'status': status.toLowerCase(),
              'user_logged_in': !!session?.user
            });
            
          if (fallbackError) {
            console.error('Fallback search logging also failed:', fallbackError);
          } else {
            console.log('Fallback search logging succeeded');
          }
        }
      } else {
        console.log('Search logged successfully');
      }
    } catch (err) {
      // More detailed error logging for debugging
      console.error('Error logging search:', err);
    }
  };

  return { logSearch };
};
