
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Attempts to use the optimized PostGIS spatial search function with improved error handling and timeout management
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[] | null> {
  console.log('Using PostGIS spatial function for efficient search', { lat, lng, radiusKm, filters });
  
  try {
    // Add a timeout to the spatial search (increased to 12 seconds)
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Spatial search timeout after 12 seconds'));
      }, 12000); // 12 second timeout
    });
    
    console.log('Starting spatial search with RPC call');
    const startTime = Date.now();
    
    // Try to execute the spatial function with a timeout
    const resultPromise = supabase
      .rpc('get_nearby_applications', { 
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 200 // Reduce limit to improve performance
      });
    
    // Race between the query and the timeout
    const { data: spatialData, error: spatialError } = await Promise.race([
      resultPromise,
      timeoutPromise
    ]) as any;
    
    const endTime = Date.now();
    console.log(`Spatial query execution time: ${endTime - startTime}ms`);
      
    if (spatialError) {
      console.error('PostGIS function detailed error:', {
        error: spatialError,
        code: spatialError.code,
        message: spatialError.message,
        details: spatialError.details,
        hint: spatialError.hint,
        queryTime: `${endTime - startTime}ms`,
        searchParams: { lat, lng, radiusKm }
      });
      return null;
    }
    
    if (!spatialData || spatialData.length === 0) {
      console.log('No results from spatial search', { lat, lng, radiusKm });
      return [];
    }
    
    console.log(`✅ Found ${spatialData.length} planning applications using spatial query`);
    
    // Apply filters after getting the data
    let filteredData = spatialData;
    
    if (filters.status) {
      console.log('Filtering by status:', filters.status);
      filteredData = filteredData.filter(app => 
        app.status && app.status.toLowerCase().includes(filters.status!.toLowerCase())
      );
    }
    
    if (filters.type) {
      console.log('Filtering by type:', filters.type);
      filteredData = filteredData.filter(app => 
        (app.type && app.type.toLowerCase().includes(filters.type!.toLowerCase())) ||
        (app.application_type_full && app.application_type_full.toLowerCase().includes(filters.type!.toLowerCase()))
      );
    }
    
    if (filters.classification) {
      console.log('Filtering by classification:', filters.classification);
      filteredData = filteredData.filter(app => 
        app.class_3 && app.class_3.toLowerCase().includes(filters.classification!.toLowerCase())
      );
    }
    
    console.log(`After filtering: ${filteredData.length} applications remain`);
    
    // Calculate distance and add it to the results
    const results = filteredData.map(app => {
      const distance = calculateDistance(
        lat,
        lng,
        Number(app.latitude),
        Number(app.longitude)
      );
      return { ...app, distance };
    });
    
    return results;
  } catch (error) {
    console.error('Detailed error in spatial search:', {
      error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      searchParams: { lat, lng, radiusKm, filters }
    });
    return null;
  }
}
