
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { useSearchLogger } from "@/hooks/use-search-logger";
import { type PostgrestResponse } from '@supabase/supabase-js';

/**
 * Hook for performing PostGIS spatial searches for planning applications
 */
export const useSpatialSearch = () => {
  const { logSearch, logSearchError } = useSearchLogger();

  const searchNearbyApplications = async (lat: number, lng: number, radius: number, limit = 25) => {
    try {
      console.log(`Performing spatial search at ${lat},${lng} with radius ${radius}km`);
      
      // Try to use the optimized spatial function if available
      const query = supabase
        .rpc('get_nearby_applications', {
          latitude: lat,
          longitude: lng,
          distance_km: radius,
          max_results: limit
        });

      // Add timeout to query execution
      const response: PostgrestResponse<any> = await withTimeout(
        query, 
        30000, 
        'Spatial search timeout'
      );
      
      if (response.error) {
        console.error('Error in spatial search:', response.error);
        // Check if it's a function not found error (common if PostGIS is not set up)
        const isFunctionMissingError = 
          response.error.message.includes('function') && 
          (response.error.message.includes('does not exist') || response.error.message.includes('not found'));
          
        logSearchError('spatial', isFunctionMissingError ? 'function_missing' : 'database_error', JSON.stringify(response.error));
        
        // Return error for caller to handle
        return { data: [], error: response.error };
      }

      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} results from spatial search`);
        return { data: response.data, error: null };
      }
      
      return { data: [], error: new Error('Invalid response format from database') };
    } catch (error) {
      console.error('Error in spatial search:', error);
      logSearchError('spatial', 'exception', error instanceof Error ? error.message : String(error));
      return { data: [], error };
    }
  };

  return { searchNearbyApplications };
};
