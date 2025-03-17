
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { type PostgrestResponse } from '@supabase/supabase-js';
import { SearchFilters } from "./types";

/**
 * Standalone function for direct use in other modules
 * This performs the actual spatial search query to the database
 */
export const performSpatialSearch = async (
  lat: number, 
  lng: number, 
  radius: number, 
  filters?: SearchFilters,
  limit = 25
): Promise<any[] | null> => {
  try {
    console.log(`Performing standalone spatial search at ${lat},${lng} with radius ${radius}km`);
    
    // Build the query
    let query = supabase
      .rpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        distance_km: radius,
        max_results: limit
      });
    
    // Apply filters if provided (simplified example - expand based on your filter structure)
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('category', filters.type);
      }
    }

    // Add timeout to query execution
    const response = await withTimeout<PostgrestResponse<any>>(
      query, 
      30000, 
      'Spatial search timeout'
    );
    
    if (response && 'data' in response && 'error' in response) {
      const { data, error } = response;
      
      if (error) {
        console.error('Error in spatial search:', error);
        // If it's a function missing error, return null to trigger fallback
        const isFunctionMissingError = 
          error.message.includes('function') && 
          (error.message.includes('does not exist') || error.message.includes('not found'));
          
        if (isFunctionMissingError) {
          console.log('Spatial function not available, returning null to trigger fallback');
          return null;
        }
        
        return [];
      }

      if (data && Array.isArray(data)) {
        console.log(`Found ${data.length} results from spatial search`);
        return data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in standalone spatial search:', error);
    return [];
  }
};
