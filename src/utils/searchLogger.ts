import { supabase } from "@/integrations/supabase/client";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

// Keep track of recent search terms to prevent duplicate logging
const recentSearches = new Map<string, number>();

/**
 * Log search terms to Supabase Searches table and console
 */
export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  try {
    const env = getEnvironmentName();
    const hostname = getCurrentHostname();
    
    console.log(`[SearchLogger][${env}][${hostname}] Attempting to log search: "${searchTerm}" (${type})`);
    
    // Check if we've logged this search recently (within 10 seconds)
    const now = Date.now();
    const key = `${searchTerm}:${type}:${tab || 'unknown'}`;
    const lastLogged = recentSearches.get(key);
    
    if (lastLogged && now - lastLogged < 10000) {
      console.log(`[SearchLogger][${env}] Skipping duplicate search log: "${searchTerm}" (${type})`);
      return true;
    }
    
    // Log to console
    console.log(`[SearchLogger][${env}] Logging search: "${searchTerm}" (${type}) from ${tab || 'unknown'} tab`);
    
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
        console.warn(`[SearchLogger][${env}] Table check failed:`, countError.message);
        return true;
      }
      
      console.log(`[SearchLogger][${env}] Searches table exists, proceeding with insert`);
      
      // Successfully validated table exists, now insert with error handling
      const insertPayload = {
        search_term: searchTerm,
        type: type, 
        tab: tab || 'unknown',
        user_id: session?.user?.id || null,
        timestamp: new Date().toISOString(),
        environment: env,
        hostname: hostname
      };
      
      console.log(`[SearchLogger][${env}] Insert payload:`, insertPayload);
      
      const { error } = await supabase
        .from('Searches')
        .insert(insertPayload);
      
      if (error) {
        console.warn(`[SearchLogger][${env}] Search log failed:`, error.message, error.details);
      } else {
        console.log(`[SearchLogger][${env}] Search logged successfully`);
      }
    } catch (insertError) {
      console.error(`[SearchLogger][${env}] Exception during search logging:`, insertError);
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
    console.error(`[SearchLogger] Failed to log search:`, err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
};
