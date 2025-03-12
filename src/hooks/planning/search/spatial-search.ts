
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications using PostGIS
 * Returns null if the function is not available, which will trigger fallback search
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    console.log('Attempting spatial search with RPC function');
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Progressive loading strategy:
    // 1. First try to get a small batch of results quickly (25 records)
    // 2. Then try to get more complete results (up to 100 records)
    
    // Quick query with smaller limit for fast initial results
    const quickQuery = supabase.rpc(
      'get_nearby_applications',
      {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 25 // Small limit for fast initial results
      }
    );
    
    // Add timeout by using Promise.race
    const quickTimeout = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Quick spatial search timeout')), 8000);
    });
    
    try {
      // Race between the query and timeout
      const { data: quickData, error: quickError } = await Promise.race([
        quickQuery,
        quickTimeout.then(() => ({ data: null, error: new Error('Timeout') }))
      ]);
      
      // Handle RPC function errors
      if (quickError) {
        // Log the specific error for debugging
        console.error('Spatial search quick fetch error:', quickError.code, quickError.message);
        
        // If function doesn't exist, use fallback
        if (quickError.message.includes('function') && 
            (quickError.message.includes('exist') || 
             quickError.message.includes('not found') ||
             quickError.message.includes('does not exist'))) {
          console.log('Spatial search RPC function not available, will use fallback search');
          return null;
        }
        
        // Return null for timeouts to trigger fallback
        if (quickError.message.includes('timeout') || 
            quickError.message.includes('cancel') ||
            quickError.message.includes('57014')) {
          console.warn('Spatial search timeout, will use fallback search');
          return null;
        }
        
        // For other errors, also use fallback
        return null;
      }
      
      // Process initial results if available
      if (quickData && quickData.length > 0) {
        console.log(`Got ${quickData.length} quick results from spatial search`);
        const processedQuickData = processResults(quickData, lat, lng, filters);
        
        // Try to get more complete results in the background
        try {
          // Use a longer timeout for the full results
          const fullQuery = supabase.rpc(
            'get_nearby_applications',
            {
              center_lat: lat,
              center_lng: lng,
              radius_km: radiusKm,
              result_limit: 100 // More complete results
            }
          );
          
          // Set a longer timeout for full results
          const fullTimeout = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('Full spatial search timeout')), 15000);
          });
          
          const { data: fullData } = await Promise.race([
            fullQuery,
            fullTimeout.then(() => ({ data: null }))
          ]);
          
          if (fullData && fullData.length > quickData.length) {
            console.log(`Got ${fullData.length} total results from complete spatial search`);
            return processResults(fullData, lat, lng, filters);
          } else {
            console.log('Full query returned no additional results, using quick results');
          }
        } catch (fullError) {
          console.warn('Full spatial query failed or timed out, using quick results:', fullError);
        }
        
        // Return the quick results if full results failed or returned no additional data
        return processedQuickData;
      } else {
        console.log('Quick query returned no results');
      }
    } catch (quickErr) {
      console.error('Quick query failed:', quickErr);
    }
    
    // If no quick results, try one more time with higher limit
    // but still with reasonable timeout
    const finalQuery = supabase.rpc(
      'get_nearby_applications',
      {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 100 // Try with full limit
      }
    );
    
    // Set a timeout for the final query
    const finalTimeout = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Final spatial search timeout')), 12000);
    });
    
    try {
      // Race between the query and timeout
      const { data, error } = await Promise.race([
        finalQuery,
        finalTimeout.then(() => ({ data: null, error: new Error('Timeout') }))
      ]);
      
      if (error) {
        console.error('Final spatial search error:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('No results found in spatial search');
        return [];
      }
      
      console.log(`Got ${data.length} results from spatial search`);
      return processResults(data, lat, lng, filters);
    } catch (err) {
      console.error('Final spatial search error:', err);
      return null; // Return null to indicate fallback should be used
    }
  } catch (error) {
    console.error('Spatial search error:', error);
    return null; // Return null to indicate fallback should be used
  }
}

/**
 * Process and filter the results from the spatial search
 */
function processResults(data: any[], lat: number, lng: number, filters: any): Application[] {
  // Apply additional filters if needed
  let filteredData = data;
  
  if (filters) {
    filteredData = data.filter((app: any) => {
      // Status filter
      if (filters.status && app.status && 
          !app.status.toLowerCase().includes(filters.status.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type && app.type && 
          !app.type.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }
  
  // Add distance and sort by distance
  return filteredData
    .filter((app: any) => {
      return (typeof app.latitude === 'number' && typeof app.longitude === 'number');
    })
    .map((app: any) => {
      const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
      const distanceMiles = distanceKm * 0.621371;
      
      return {
        ...app,
        distance: `${distanceMiles.toFixed(1)} mi`,
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    })
    .sort((a: any, b: any) => {
      const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
      const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
      return distA - distB;
    });
}
