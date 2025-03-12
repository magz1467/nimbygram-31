
/**
 * Search console diagnostics - tools for debugging search functionality
 * Import in console using: 
 * import('/src/utils/search-console-diagnostics.ts').then(m => window.searchTools = m)
 */

import { supabase } from '@/integrations/supabase/client';
import { searchDiagnostics } from './search-diagnostics';

// Diagnostic functions for the search process
export const diagnostics = {
  /**
   * Prints the current search history
   */
  printSearchHistory: () => {
    console.table(searchDiagnostics.getSearchHistory());
  },
  
  /**
   * Runs a test search to verify functionality
   */
  runTestSearch: async (lat = 51.5074, lng = -0.1278, radius = 10) => {
    console.log(`🔍 Running test search at [${lat}, ${lng}] with ${radius}km radius...`);
    
    try {
      const start = Date.now();
      const { data, error } = await supabase.rpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        radius_km: radius
      });
      const duration = Date.now() - start;
      
      if (error) {
        console.error('❌ Test search failed:', error);
        return { success: false, error, duration };
      }
      
      console.log(`✅ Test search succeeded in ${duration}ms, found ${data?.length || 0} results`);
      if (data && data.length > 0) {
        console.log('📊 First result:', data[0]);
      }
      
      return { success: true, data, count: data?.length || 0, duration };
    } catch (error) {
      console.error('❌ Test search exception:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Checks if a column exists in a table
   */
  checkColumn: async (table: string, column: string) => {
    try {
      const { data, error } = await supabase.rpc('check_column_exists', {
        p_table_name: table,
        p_column_name: column
      });
      
      if (error) {
        console.error(`❌ Error checking if ${column} exists in ${table}:`, error);
        return { exists: false, error };
      }
      
      console.log(`Column ${column} in table ${table} exists: ${data}`);
      return { exists: !!data };
    } catch (error) {
      console.error('❌ Exception checking column:', error);
      return { exists: false, error };
    }
  },
  
  /**
   * Lists tables in the database
   */
  listTables: async () => {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        console.error('❌ Error listing tables:', error);
        return { success: false, error };
      }
      
      console.log('📋 Available tables:', data?.map(t => t.table_name));
      return { success: true, tables: data?.map(t => t.table_name) };
    } catch (error) {
      console.error('❌ Exception listing tables:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Performs a direct query to the crystal_roof table
   */
  queryCrystalRoof: async (limit = 10) => {
    try {
      console.log(`🔍 Querying crystal_roof table (limit: ${limit})...`);
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('*')
        .limit(limit);
      
      if (error) {
        console.error('❌ Error querying crystal_roof:', error);
        return { success: false, error };
      }
      
      console.log(`✅ Query returned ${data?.length || 0} rows`);
      console.log('📊 Sample data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception querying crystal_roof:', error);
      return { success: false, error };
    }
  }
};

// Add to window object for console access
(window as any).searchConsoleTools = diagnostics;
console.log('🔧 Search console diagnostic tools loaded');

export default diagnostics;
