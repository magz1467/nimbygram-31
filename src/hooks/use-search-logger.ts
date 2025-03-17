
import { supabase } from "@/integrations/supabase/client";

type SearchStatus = 'recent' | 'completed';

export const useSearchLogger = () => {
  const logSearch = async (postcode: string, status: SearchStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to console for debugging
      console.log(`Logging search: ${postcode} with status: ${status}`);
      console.log('Current hostname:', window.location.hostname);
      
      // Try both column naming conventions to handle different environments
      try {
        // First try with 'Post Code' convention (PascalCase)
        const { error } = await supabase
          .from('Searches')
          .insert({
            'Post Code': postcode,
            'Status': status,
            'User_logged_in': !!session?.user,
            'Timestamp': new Date().toISOString()
          });

        if (error) {
          console.warn('Error with PascalCase column names:', error);
          
          // If that fails, try with snake_case convention
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            const { error: snakeCaseError } = await supabase
              .from('Searches')
              .insert({
                'search_term': postcode,
                'status': status.toLowerCase(),
                'user_logged_in': !!session?.user,
                'timestamp': new Date().toISOString()
              });
              
            if (snakeCaseError) {
              console.error('Snake case search logging also failed:', snakeCaseError);
            } else {
              console.log('Snake case search logging succeeded');
            }
          } else {
            // Error is not related to column names
            console.error('Search logging error (not column-related):', error);
          }
        } else {
          console.log('PascalCase search logging succeeded');
        }
      } catch (insertError) {
        console.error('Exception during search logging attempt:', insertError);
      }
    } catch (err) {
      // More detailed error logging for debugging
      console.error('Error in useSearchLogger:', err);
    }
  };

  return { logSearch };
};
