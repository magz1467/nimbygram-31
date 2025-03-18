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
    
    // Check if the Searches table exists before trying to insert
    try {
      const { count, error: countError } = await supabase
        .from('Searches')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (countError) {
        console.warn('Skipping search logging - table may not exist:', countError.message);
        return true;
      }
      
      // Successfully validated table exists, now insert with error handling
      const { error } = await supabase
        .from('Searches')
        .insert({
          search_term: searchTerm,
          type: type, 
          tab: tab || 'unknown',
          user_id: session?.user?.id || null,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Search log failed:', error.message);
        // Don't try alternative column names as this creates confusion
        // Just log the error and move on
      } else {
        console.log('Search logged successfully');
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
