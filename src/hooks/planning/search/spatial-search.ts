
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";

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
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      console.error(`🔍 Invalid coordinates for spatial search: [${lat}, ${lng}]`);
      return null;
    }
    
    // Try to use the PostGIS function if available
    const { data: spatialData, error: spatialError } = await supabase
      .rpc('get_nearby_applications', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radius,
        result_limit: 100
      });
    
    // If we get a function not found error or other error, return null to trigger fallback
    if (spatialError) {
      if (spatialError.message.includes('function') || 
          spatialError.message.includes('not found')) {
        console.log('PostGIS function not available, will use fallback');
        return null;
      }
      
      console.error('Spatial search error:', spatialError);
      throw spatialError;
    }
    
    if (spatialData) {
      console.log(`✅ Spatial search successful, found ${spatialData.length} applications`);
      
      // Log the coordinates we searched around
      console.log(`✅ Search was performed at [${lat}, ${lng}] with radius ${radius}km`);
      
      // Check if storybook data is present in the first result
      if (spatialData.length > 0) {
        console.log('First result storybook check:', {
          hasStorybook: Boolean(spatialData[0].storybook),
          id: spatialData[0].id
        });
        
        if (spatialData[0].storybook) {
          console.log(`Storybook preview: ${spatialData[0].storybook.substring(0, 100)}...`);
        }
      }
      
      // Apply any filters if needed
      let filteredData = spatialData;
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
