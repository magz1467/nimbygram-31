
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";
import { withTimeout } from "@/utils/fetchUtils";
import { PostgrestResponse } from "@supabase/supabase-js";

/**
 * Performs a spatial search using PostGIS for nearby applications
 */
export const performSpatialSearch = async (
  lat: number,
  lng: number,
  radius: number = 5,
  filters: any = {}
): Promise<Application[] | null> => {
  try {
    console.log(`🔍 Attempting spatial search near [${lat}, ${lng}] with radius ${radius}km`);
    
    // Calculate if this is likely a large area search
    // Large cities or regions will have a larger radius
    const isLargeArea = radius > 3 || (
      // Check if coordinates are likely for a large city or region center
      // These are somewhat approximate checks but help identify city centers
      (lat > 50 && lat < 59 && lng > -6 && lng < 2) && // UK mainland
      // Check if this is a major population center by checking if coordinates
      // match common formats for city centers which typically have round numbers
      (Math.abs(Math.round(lat * 100) - lat * 100) < 15 || 
       Math.abs(Math.round(lng * 100) - lng * 100) < 15)
    );
    
    console.log(`🔍 Area analysis: isLargeArea=${isLargeArea}, radius=${radius}`);
    
    // For large areas, we'll use progressive loading with a lower initial timeout
    // to ensure users get at least some results quickly
    let timeout = isLargeArea ? 8000 : 15000; // 8 seconds for large areas, 15 for smaller
    
    // Try to use the PostGIS function if available with appropriate timeout
    const spatialPromise = supabase
      .rpc('get_nearby_applications', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radius,
        result_limit: isLargeArea ? 25 : 100  // Lower limit for large areas to get faster results
      });
    
    // Add timeout to the promise
    const result = await withTimeout<PostgrestResponse<any>>(
      spatialPromise,
      timeout,
      `Search timeout reached after ${timeout/1000} seconds. Some results may be available.`
    );
    
    // Now we can safely access data and error properties
    const { data, error } = result;
    
    // If we get a function not found error or other error, return null to trigger fallback
    if (error) {
      if (error.message.includes('function') || 
          error.message.includes('not found')) {
        console.log('PostGIS function not available, will use fallback');
        return null;
      }
      
      console.error('Spatial search error:', error);
      
      // For timeout errors with large areas, we might still have partial results
      if (isLargeArea && 
          (error.message.includes('timeout') || 
           error.message.includes('statement') || 
           error.message.includes('cancel'))) {
        console.log('Large area timeout, but we might have partial results');
        // If we don't have any data, return null to trigger fallback
        if (!data) {
          return null;
        }
        // Otherwise, we'll continue with the partial results we have
      } else {
        throw error;
      }
    }
    
    if (data) {
      console.log(`✅ Spatial search retrieved ${data.length} applications`);
      
      // Check if storybook data is present in the first result
      if (data.length > 0) {
        console.log('First result storybook check:', {
          hasStorybook: Boolean(data[0].storybook),
          id: data[0].id
        });
        
        if (data[0].storybook) {
          console.log(`Storybook preview: ${data[0].storybook.substring(0, 100)}...`);
        }
      }
      
      // Apply any filters if needed
      let filteredData = data;
      if (filters && Object.keys(filters).length > 0) {
        // Apply status filter if present
        if (filters.status) {
          filteredData = filteredData.filter((app: any) => 
            app.status?.toLowerCase().includes(filters.status.toLowerCase())
          );
        }
        
        // Apply type filter if present
        if (filters.type) {
          filteredData = filteredData.filter((app: any) => 
            app.type?.toLowerCase().includes(filters.type.toLowerCase())
          );
        }
      }
      
      return transformApplicationsData(filteredData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in spatial search:', error);
    return null; // Return null to trigger fallback
  }
};
