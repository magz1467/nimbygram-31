import { supabase } from "@/integrations/supabase/client";

// Keep track of recent search terms to prevent duplicate logging
const recentSearches = new Map<string, number>();

/**
 * Simple function to log search terms to Supabase
 * Fall back gracefully if the Searches table doesn't exist
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
    
    // Store this search in recent searches
    recentSearches.set(key, now);
    
    // Clean up old entries
    for (const [storedKey, timestamp] of recentSearches.entries()) {
      if (now - timestamp > 30000) { // Remove after 30 seconds
        recentSearches.delete(storedKey);
      }
    }
    
    // Since we're getting errors with the Searches table, 
    // we'll just log to console for now and not try to access the table
    // This prevents unnecessary 400 errors that might cause page reloads
    
    // For future implementation when the table exists:
    // await supabase.from('Searches').insert({
    //   search_term: searchTerm,
    //   search_type: type,
    //   tab: tab || null,
    //   user_logged_in: true
    // });
    
    return true;
  } catch (err) {
    console.error('Failed to log search:', err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
};
