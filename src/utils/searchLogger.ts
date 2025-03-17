
import { supabase } from "@/integrations/supabase/client";

// Keep track of recent search terms to prevent duplicate logging
const recentSearches = new Map<string, number>();

/**
 * Log search terms to Supabase Searches table and console
 */
export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    // Check if we've logged this search recently (within 10 seconds)
    const now = Date.now();
    const key = `${searchTerm}:${type}:${tab || 'unknown'}`;
    const lastLogged = recentSearches.get(key);
    
    if (lastLogged && now - lastLogged < 10000) {
      console.log(`Skipping duplicate search log: ${searchTerm} (${type})`);
      return true;
    }
    
    // Log to console
    console.log(`Logging search: ${searchTerm} (${type}) from ${tab || 'unknown'} tab`);
    
    // Get current user session (if logged in)
    const { data: { session } } = await supabase.auth.getSession();
    
    // Try to handle differences in column naming between environments
    try {
      // First try with original column names
      const { error } = await supabase
        .from('Searches')
        .insert({
          search_term: searchTerm,
          search_type: type,
          tab: tab || 'unknown',
          user_id: session?.user?.id || null,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Search log failed with standard column names, trying alternate column names:', error);
        
        // If first attempt fails with a column name error, try with alternative column names
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          // Try with alternative naming convention
          const { error: altError } = await supabase
            .from('Searches')
            .insert({
              'Post Code': searchTerm,
              'Status': type,
              'Tab': tab || 'unknown',
              'User_logged_in': !!session?.user,
              'Timestamp': new Date().toISOString()
            });
          
          if (altError) {
            console.error('Failed to log search with alternative column names too:', altError);
          } else {
            console.log('Search logged successfully with alternative column names');
          }
        } else {
          console.error('Failed to log search to database:', error);
        }
      } else {
        console.log('Search logged successfully with standard column names');
      }
    } catch (insertError) {
      console.error('Exception during search logging:', insertError);
    }
    
    // Store this search in recent searches
    recentSearches.set(key, now);
    
    // Clean up old entries
    for (const [storedKey, timestamp] of recentSearches.entries()) {
      if (now - timestamp > 30000) { // Remove after 30 seconds
        recentSearches.delete(storedKey);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
};
