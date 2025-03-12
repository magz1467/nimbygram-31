
/**
 * Debug helper functions for troubleshooting search functionality
 */

/**
 * Prints a summary of the current application state to the console
 */
export function debugPrintAppState() {
  console.group('🔍 Application State Debug');
  
  try {
    // Search diagnostics
    if ((window as any).searchDiagnostics) {
      const searchHistory = (window as any).searchDiagnostics.getSearchHistory();
      console.log('📊 Search History:', searchHistory);
      console.log('📊 Search Summary:', (window as any).searchDiagnostics.getSummary());
    } else {
      console.log('⚠️ Search diagnostics not available');
    }
    
    // React Query cache
    if ((window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('📦 React Query Cache:', (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__.getCurrentCache());
    } else {
      console.log('⚠️ React Query devtools not available');
    }
    
    // Supabase auth
    try {
      const supabse = (window as any).supabase;
      if (supabse?.auth) {
        supabse.auth.getSession().then((session: any) => {
          console.log('🔑 Auth Session:', session);
        });
      } else {
        console.log('⚠️ Supabase auth not available');
      }
    } catch (e) {
      console.log('⚠️ Error accessing Supabase auth:', e);
    }
    
  } catch (error) {
    console.error('❌ Error in debugPrintAppState:', error);
  }
  
  console.groupEnd();
}

/**
 * Checks database connectivity by making a simple query
 * @returns Promise that resolves with connection status
 */
export async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    const supabase = (window as any).supabase;
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('id')
      .limit(1);
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('❌ Database connection error:', error);
      return { connected: false, error, duration };
    }
    
    console.log(`✅ Database connected in ${duration}ms, data:`, data);
    return { connected: true, data, duration };
    
  } catch (error) {
    console.error('❌ Error checking database connection:', error);
    return { connected: false, error };
  }
}

/**
 * Checks if the RPC function exists
 * @returns Promise that resolves with function status
 */
export async function checkRpcFunction() {
  console.log('🔍 Checking if get_nearby_applications RPC function exists...');
  
  try {
    const supabase = (window as any).supabase;
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    // Try to call the function with test parameters
    const { data, error } = await supabase
      .rpc('get_nearby_applications', {
        latitude: 51.5074,
        longitude: -0.1278,
        radius_km: 10,
        result_limit: 1
      });
    
    if (error) {
      console.error('❌ RPC function error:', error);
      
      // Check if the error indicates the function doesn't exist
      if (error.message.includes('does not exist') || error.code === '42883') {
        return { exists: false, error, reason: 'Function does not exist' };
      }
      
      return { exists: false, error, reason: 'Error calling function' };
    }
    
    console.log('✅ RPC function exists, response:', data);
    return { exists: true, data };
    
  } catch (error) {
    console.error('❌ Error checking RPC function:', error);
    return { exists: false, error };
  }
}

// Add to window object for console access
(window as any).debugHelpers = {
  debugPrintAppState,
  checkDatabaseConnection,
  checkRpcFunction
};

console.log('🔧 Debug helpers loaded. Access via window.debugHelpers in console.');

