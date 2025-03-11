
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Attempts to use the optimized PostGIS spatial search function
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[] | null> {
  console.log('Using PostGIS spatial function for efficient search');
  
  // First check if the function exists to avoid unnecessary error logs
  const { data: functionExists, error: checkError } = await supabase
    .rpc('check_table_exists', { table_name: 'get_nearby_applications' });
    
  if (checkError || !functionExists) {
    console.log('PostGIS function not available, skipping spatial search');
    return null;
  }
  
  const { data: spatialData, error: spatialError } = await supabase
    .rpc('get_nearby_applications', { 
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 500
    });
    
  if (spatialError) {
    console.warn('PostGIS function failed, falling back to manual search:', spatialError);
    return null;
  }
  
  if (!spatialData || spatialData.length === 0) {
    return [];
  }
  
  console.log(`✅ Found ${spatialData.length} planning applications using spatial query`);
  
  // Apply filters after getting the data
  let filteredData = spatialData;
  
  if (filters.status) {
    filteredData = filteredData.filter(app => 
      app.status && app.status.toLowerCase().includes(filters.status!.toLowerCase())
    );
  }
  
  if (filters.type) {
    filteredData = filteredData.filter(app => 
      (app.type && app.type.toLowerCase().includes(filters.type!.toLowerCase())) ||
      (app.application_type_full && app.application_type_full.toLowerCase().includes(filters.type!.toLowerCase()))
    );
  }
  
  if (filters.classification) {
    filteredData = filteredData.filter(app => 
      app.class_3 && app.class_3.toLowerCase().includes(filters.classification!.toLowerCase())
    );
  }
  
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
}
