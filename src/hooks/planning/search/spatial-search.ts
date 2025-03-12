
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Checks if the PostGIS spatial search function exists in the database
 * @returns Promise resolving to true if the function exists, false otherwise
 */
async function checkSpatialFunctionExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_table_exists', { table_name: 'get_nearby_applications' });
      
    if (error || !data) {
      console.log('PostGIS function availability check failed:', error?.message || 'Unknown error');
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.warn('Error checking PostGIS function:', err);
    return false;
  }
}

/**
 * Executes the PostGIS spatial search function
 * @param lat Latitude of the search center
 * @param lng Longitude of the search center
 * @param radiusKm Radius in kilometers
 * @returns Promise with the raw results from the spatial function
 */
async function executeSpatialQuery(lat: number, lng: number, radiusKm: number): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_applications', { 
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 500
      });
      
    if (error) {
      console.warn('PostGIS function error:', error.message);
      return null;
    }
    
    return data || [];
  } catch (err) {
    console.error('Error executing spatial query:', err);
    return null;
  }
}

/**
 * Applies filters to the spatial search results
 * @param results Raw results from the spatial function
 * @param filters Search filters to apply
 * @returns Filtered results
 */
function applyFilters(results: any[], filters: SearchFilters): any[] {
  let filteredData = [...results];
  
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
  
  return filteredData;
}

/**
 * Adds distance calculations to the results
 * @param results Filtered results
 * @param lat Latitude of the search center
 * @param lng Longitude of the search center
 * @returns Results with distance calculations
 */
function addDistanceCalculations(results: any[], lat: number, lng: number): Application[] {
  return results.map(app => {
    const distance = calculateDistance(
      lat,
      lng,
      Number(app.latitude),
      Number(app.longitude)
    );
    return { ...app, distance };
  });
}

/**
 * Attempts to use the optimized PostGIS spatial search function
 * This function is structured as a pipeline of operations that can fail gracefully
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[] | null> {
  console.log('Attempting PostGIS spatial search with parameters:', { lat, lng, radiusKm });
  
  // First check if the function exists to avoid unnecessary error logs
  const functionExists = await checkSpatialFunctionExists();
  if (!functionExists) {
    console.log('PostGIS function not available, skipping spatial search');
    return null;
  }
  
  // Execute the spatial query
  const spatialData = await executeSpatialQuery(lat, lng, radiusKm);
  if (!spatialData) {
    console.warn('PostGIS function failed, will use fallback search method');
    return null;
  }
  
  if (spatialData.length === 0) {
    console.log('Spatial search found no results');
    return [];
  }
  
  console.log(`✅ Found ${spatialData.length} planning applications using spatial query`);
  
  // Apply filters after getting the data
  const filteredData = applyFilters(spatialData, filters);
  console.log(`After filtering: ${filteredData.length} results remaining`);
  
  // Calculate distance and add it to the results
  const resultsWithDistance = addDistanceCalculations(filteredData, lat, lng);
  
  return resultsWithDistance;
}
