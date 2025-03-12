
/**
 * Debug helpers for troubleshooting search functionality
 */

// Create a global debug object to store helpers
const debugHelpers = {
  /**
   * Test direct RPC call to Supabase
   */
  testSupabaseRpc: async (fnName: string, params: any) => {
    try {
      // Dynamically import Supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      console.log(`🔍 Testing RPC call to ${fnName} with params:`, params);
      
      const startTime = Date.now();
      const { data, error } = await supabase.rpc(fnName, params);
      const duration = Date.now() - startTime;
      
      if (error) {
        console.error(`❌ RPC test failed: ${error.message}`, error);
        return { success: false, error, duration };
      }
      
      console.log(`✅ RPC test succeeded in ${duration}ms`, { data });
      return { success: true, data, duration };
    } catch (err) {
      console.error('❌ Exception during RPC test:', err);
      return { success: false, error: err };
    }
  },
  
  /**
   * Test search at specific coordinates
   */
  testSearchAt: async (lat = 51.5074, lng = -0.1278) => {
    try {
      console.log(`🔍 Testing search at [${lat}, ${lng}]`);
      const result = await debugHelpers.testSupabaseRpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        radius_km: 10
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.data?.length || 0} applications near [${lat}, ${lng}]`);
      }
      
      return result;
    } catch (err) {
      console.error('❌ Test search failed:', err);
      return { success: false, error: err };
    }
  },
  
  /**
   * Log current search state
   */
  logSearchState: () => {
    try {
      // Try to access current state from any global variables or localStorage
      const coordinates = localStorage.getItem('last_search_coordinates');
      console.log('🔍 Current search coordinates from localStorage:', coordinates);
      
      // Log React Query cache if available
      if ((window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('🔍 React Query cache:', (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__.getCache());
      }
      
      return { coordinates };
    } catch (err) {
      console.error('❌ Failed to log search state:', err);
      return { error: err };
    }
  }
};

// Add to window for console access
(window as any).debugHelpers = debugHelpers;

// Export for module usage
export default debugHelpers;
