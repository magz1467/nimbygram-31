import { supabase } from "@/integrations/supabase/client";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

// Keep track of recent search terms to prevent duplicate logging
const recentSearches = new Map<string, number>();

/**
 * Log search terms to Supabase Searches table and console
 */
export async function logSearch(searchTerm: string, searchType: string) {
  try {
    const env = getEnvironmentName();
    const hostname = getCurrentHostname();
    
    console.log(`[SearchLogger][${env}][${hostname}] 🔍 Attempting to log search: "${searchTerm}" (${searchType})`);
    
    // Check if we've logged this search recently (within 10 seconds)
    const now = Date.now();
    const key = `${searchTerm}:${searchType}:${hostname}`;
    const lastLogged = recentSearches.get(key);
    
    if (lastLogged && now - lastLogged < 10000) {
      console.log(`[SearchLogger][${env}] Skipping duplicate search log: "${searchTerm}" (${searchType})`);
      return true;
    }
    
    // Log to console with environment info
    console.log(`[SearchLogger][${env}][${hostname}] Logging search: "${searchTerm}" (${searchType})`);
    
    // Get current user session (if logged in)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn(`[SearchLogger][${env}] Session error:`, sessionError.message);
    }
    
    // Check if the Searches table exists before trying to insert
    try {
      console.log(`[SearchLogger][${env}] Checking if Searches table exists...`);
      const { count, error: countError } = await supabase
        .from('Searches')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (countError) {
        console.warn(`[SearchLogger][${env}] Table check failed:`, countError.message, countError.details);
        return true;
      }
      
      console.log(`[SearchLogger][${env}] ✅ Searches table exists, proceeding with insert`);
      
      // Try to log with current schema
      const { error } = await supabase
        .from('Searches')
        .insert({
          search_term: searchTerm,
          search_type: searchType,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Search log failed:', error.message);
        
        // If the error is about missing columns, try with only the columns we know exist
        if (error.code === 'PGRST204') {
          // Fall back to logging just the search term if search_type column doesn't exist
          const { error: fallbackError } = await supabase
            .from('Searches')
            .insert({
              search_term: searchTerm,
              timestamp: new Date().toISOString()
            });
          
          if (fallbackError) {
            console.error('Failed to log search even with fallback:', fallbackError);
          } else {
            console.log('Search logged with fallback schema');
          }
        }
      } else {
        console.log('Search logged successfully');
      }
    } catch (insertError) {
      console.error(`[SearchLogger][${env}] 🔴 Exception during search logging:`, insertError);
    }
    
    // Store this search in recent searches regardless of logging success
    recentSearches.set(key, now);
    
    // Clean up old entries
    for (const [storedKey, timestamp] of recentSearches.entries()) {
      if (now - timestamp > 30000) { // Remove after 30 seconds
        recentSearches.delete(storedKey);
      }
    }
    
    return true;
  } catch (err) {
    const env = getEnvironmentName(); // Added this line to define env within this scope
    console.error(`[SearchLogger][${env}] 🔴 Failed to log search:`, err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
}
