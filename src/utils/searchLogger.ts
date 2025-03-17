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
    
    // Insert into Searches table - use the correct column names for your schema
    const { error } = await supabase
      .from('Searches')
      .insert({
        'Post Code': searchTerm,
        'Status': type,
        'User_logged_in': !!session?.user,
        'Tab': tab || 'unknown'
      });
    
    if (error) {
      console.error('Failed to log search to database:', error);
      // Don't throw - we still want to return true to prevent breaking the app
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
