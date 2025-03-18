import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";
import { getCurrentHostname, getEnvironmentName } from "@/utils/environment";

/**
 * Performs a spatial search using PostGIS for nearby applications
 */
export const performSpatialSearch = async (
  lat: number,
  lng: number,
  radius: number = 5,
  filters: any = {}
): Promise<Application[] | null> => {
  const env = getEnvironmentName();
  const hostname = getCurrentHostname();
  
  try {
    console.log(`[SpatialSearch][${env}][${hostname}] 🔍 Attempting spatial search near [${lat}, ${lng}] with radius ${radius}km`);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      console.error(`[SpatialSearch][${env}] 🔍 Invalid coordinates for spatial search: [${lat}, ${lng}]`);
      return null;
    }
    
    // First check if the PostGIS function exists
    console.log(`[SpatialSearch][${env}] Checking if PostGIS function exists...`);
    
    try {
      // Check if the function exists by calling it with a limit of 1
      const { data: testData, error: testError } = await supabase
        .rpc('get_nearby_applications', {
          center_lat: lat,
          center_lng: lng,
          radius_km: 1,
          result_limit: 1
        });
      
      // If there's an error with the function not found, log and return null
      if (testError) {
        if (testError.message.includes('function') || 
            testError.message.includes('not found')) {
          console.log(`[SpatialSearch][${env}] PostGIS function not available: ${testError.message}`);
          console.log(`[SpatialSearch][${env}] Will use fallback search method`);
          return null;
        }
        
        // Other errors should be logged but we'll still try the full search
        console.warn(`[SpatialSearch][${env}] Test query had error, but will try full search: ${testError.message}`);
      } else {
        console.log(`[SpatialSearch][${env}] PostGIS function exists, proceeding with full search`);
      }
    } catch (testErr) {
      console.error(`[SpatialSearch][${env}] Error testing PostGIS function:`, testErr);
      // Continue to full search despite test error
    }
    
    // Try to use the PostGIS function for the actual search
    console.log(`[SpatialSearch][${env}] Executing spatial search with params:`, {
      center_lat: lat,
      center_lng: lng,
      radius_km: radius,
      result_limit: 100
    });
    
    const startTime = Date.now();
    const { data: spatialData, error: spatialError } = await supabase
      .rpc('get_nearby_applications', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radius,
        result_limit: 100
      });
    const duration = Date.now() - startTime;
    
    console.log(`[SpatialSearch][${env}] Query took ${duration}ms to complete`);
    
    // If we get a function not found error or other error, return null to trigger fallback
    if (spatialError) {
      if (spatialError.message.includes('function') || 
          spatialError.message.includes('not found')) {
        console.log(`[SpatialSearch][${env}] PostGIS function not available: ${spatialError.message}`);
        return null;
      }
      
      console.error(`[SpatialSearch][${env}] Spatial search error:`, spatialError);
      throw spatialError;
    }
    
    if (spatialData) {
      console.log(`[SpatialSearch][${env}] ✅ Spatial search successful, found ${spatialData.length} applications`);
      console.log(`[SpatialSearch][${env}] ✅ Search was performed at [${lat}, ${lng}] with radius ${radius}km`);
      
      // Check if storybook data is present in the first result
      if (spatialData.length > 0) {
        console.log(`[SpatialSearch][${env}] First result storybook check:`, {
          hasStorybook: Boolean(spatialData[0].storybook),
          id: spatialData[0].id,
          storybookLength: spatialData[0].storybook ? spatialData[0].storybook.length : 0
        });
        
        if (spatialData[0].storybook) {
          console.log(`[SpatialSearch][${env}] Storybook preview: ${spatialData[0].storybook.substring(0, 100)}...`);
        }
      }
      
      // Apply any filters if needed
      let filteredData = spatialData;
      if (filters && Object.keys(filters).length > 0) {
        console.log(`[SpatialSearch][${env}] Applying filters:`, filters);
        const beforeCount = filteredData.length;
        
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
        
        console.log(`[SpatialSearch][${env}] After filtering: ${filteredData.length} results (was ${beforeCount})`);
      }
      
      const transformed = transformApplicationsData(filteredData);
      console.log(`[SpatialSearch][${env}] Transformed ${transformed.length} applications`);
      
      return transformed;
    }
    
    return [];
  } catch (error) {
    console.error(`[SpatialSearch][${env}] Error in spatial search:`, error);
    return null; // Return null to trigger fallback
  }
}
