
import { supabase } from "@/integrations/supabase/client";

export const logSearch = async (
  searchTerm: string,
  type: 'postcode' | 'location',
  status?: string
) => {
  try {
    console.log('🔍 Logging search:', {
      searchTerm,
      type,
      status,
      timestamp: new Date().toISOString()
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase.from('Searches').insert({
      'Post Code': type === 'postcode' ? searchTerm : null,
      'Location': type === 'location' ? searchTerm : null,
      'Status': status,
      'User_logged_in': !!session?.user
    });

    if (error) {
      console.error('Error logging search:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging search:', error);
    return { success: false, error };
  }
};
