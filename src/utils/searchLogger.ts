
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
    
    console.log(`[SearchLogger][${env}][${hostname}] 🔍 Attempting to log search: "${searchTerm}" (${type}) from ${tab || 'unknown'} tab`);
    
    // Check if we've logged this search recently (within 10 seconds)
    const now = Date.now();
    const key = `${searchTerm}:${type}:${tab || 'unknown'}`;
    const lastLogged = recentSearches.get(key);
    
    if (lastLogged && now - lastLogged < 10000) {
      console.log(`[SearchLogger][${env}] Skipping duplicate search log: "${searchTerm}" (${type})`);
      return true;
    }
    
    // Log to console with environment info
    console.log(`[SearchLogger][${env}][${hostname}] Logging search: "${searchTerm}" (${type}) from ${tab || 'unknown'} tab`);
    
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
      
      // Standard format payload
      const standardPayload = {
        search_term: searchTerm,
        type: type, 
        tab: tab || 'unknown',
        user_id: session?.user?.id || null,
        timestamp: new Date().toISOString(),
        environment: env,
        hostname: hostname
      };
      
      console.log(`[SearchLogger][${env}] Standard format payload:`, standardPayload);
      
      // Try with the standard column names first
      const { error: standardError } = await supabase
        .from('Searches')
        .insert(standardPayload);
      
      if (standardError) {
        console.log(`[SearchLogger][${env}] 🔴 Failed with standard column names:`, standardError.message, standardError.details);
        
        // If the first attempt fails, try with alternative column names
        console.log(`[SearchLogger][${env}] Trying alternative column format...`);
        
        const alternativePayload = {
          'Post Code': searchTerm,
          'Status': type,
          'User_logged_in': !!session?.user,
          'Timestamp': new Date().toISOString(),
          'Environment': env,
          'Tab': tab || 'unknown',
          'Hostname': hostname
        };
        
        console.log(`[SearchLogger][${env}] Alternative format payload:`, alternativePayload);
        
        const { error: altError } = await supabase
          .from('Searches')
          .insert(alternativePayload);
        
        if (altError) {
          console.log(`[SearchLogger][${env}] 🔴 Alternative format also failed:`, altError.message, altError.details);
          
          // Attempt to get table structure to debug column names
          console.log(`[SearchLogger][${env}] Attempting to get table structure...`);
          const { data: columnInfo, error: infoError } = await supabase
            .rpc('get_table_columns', { table_name: 'Searches' })
            .select('*');
          
          if (infoError) {
            console.log(`[SearchLogger][${env}] 🔴 Could not retrieve table structure:`, infoError.message);
          } else {
            console.log(`[SearchLogger][${env}] 📊 Table structure:`, columnInfo);
          }
          
          // Last resort: try using a simple key-value format
          console.log(`[SearchLogger][${env}] Trying minimal format as last attempt...`);
          const simplePayload = {
            search: searchTerm,
            env: env
          };
          
          const { error: simpleError } = await supabase
            .from('Searches')
            .insert(simplePayload);
          
          if (simpleError) {
            console.log(`[SearchLogger][${env}] 🔴 All insertion attempts failed. Last error:`, simpleError.message, simpleError.details);
          } else {
            console.log(`[SearchLogger][${env}] ✅ Successfully logged with minimal format`);
          }
        } else {
          console.log(`[SearchLogger][${env}] ✅ Successfully logged with alternative format`);
        }
      } else {
        console.log(`[SearchLogger][${env}] ✅ Successfully logged with standard format`);
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
    console.error(`[SearchLogger][${env}] 🔴 Failed to log search:`, err);
    // Don't throw - we don't want to break the app if logging fails
    return true;
  }
};
