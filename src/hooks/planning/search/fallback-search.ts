
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a manual bounding box search as a fallback when spatial search is unavailable
 * With significantly improved performance through query optimization
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[]> {
  console.log('Falling back to manual bounding box search', { lat, lng, radiusKm, filters });
  
  // For large cities like Bath, reduce the initial search radius to improve performance
  // We'll determine if the location is likely a city by checking for common indicators
  const isMajorLocation = radiusKm >= 5; // Consider any 5km+ radius search as potentially a city
  
  // Use a smaller radius for the initial search if this appears to be a city
  const searchRadiusKm = isMajorLocation ? Math.min(radiusKm, 2) : radiusKm;
  
  console.log(`Adjusted radius: ${searchRadiusKm}km (originally ${radiusKm}km)`);
  
  // Calculate bounding box (with more precise calculations)
  const latDegPerKm = 1 / 111;
  const lngDegPerKm = 1 / (111 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - (searchRadiusKm * latDegPerKm);
  const latMax = lat + (searchRadiusKm * latDegPerKm);
  const lngMin = lng - (searchRadiusKm * lngDegPerKm);
  const lngMax = lng + (searchRadiusKm * lngDegPerKm);
  
  console.log('Optimized bounding box parameters:', { latMin, latMax, lngMin, lngMax });
  
  // Create base query
  let query = supabase
    .from('crystal_roof')
    .select('*', { count: 'exact' })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax);
  
  // Add optional filters
  if (filters.status) {
    query = query.ilike('status', `%${filters.status}%`);
  }
  
  if (filters.type) {
    query = query.or(`type.ilike.%${filters.type}%`);
  }
  
  if (filters.classification) {
    query = query.ilike('class_3', `%${filters.classification}%`);
  }
  
  try {
    // Add strict limit to prevent timeouts
    console.log('Executing optimized fallback search query with limit 50');
    const startTime = Date.now();
    const { data, error, count } = await query.limit(50);
    const endTime = Date.now();
    console.log(`Query execution time: ${endTime - startTime}ms`);
    
    if (error) {
      console.error('Supabase query error details:', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        details: error.details,
        queryTime: `${endTime - startTime}ms`
      });
      
      // Handle timeout errors with a more specific error
      if (error.code === '57014' || (error.message && error.message.includes('timeout'))) {
        throw new Error('The search took too long to complete. Please try a more specific location or different filters.');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found for the search criteria', { lat, lng, radiusKm, filters });
      return [];
    }
    
    // Calculate distance for each application and sort by distance
    console.log(`Processing ${data.length} results from fallback search`);
    const results = data.map(app => {
      const distance = calculateDistance(
        lat,
        lng,
        Number(app.latitude),
        Number(app.longitude)
      );
      return { ...app, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    console.log(`✅ Found ${results.length} planning applications with fallback query`);
    
    // If we got close to the limit and used a reduced radius, warn the user
    if (results.length >= 45 && isMajorLocation) {
      console.log('Results limited for performance. Consider a more specific search location.');
    }
    
    return results;
  } catch (error) {
    console.error('Detailed error in fallback search:', {
      error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      searchParams: { lat, lng, radiusKm, filters }
    });
    
    // Provide better error messages for common issues
    if (error.message?.includes('timeout') || error.message?.includes('too long')) {
      throw new Error('The search took too long to complete. Please try a more specific location or different filters.');
    }
    
    throw new Error(`Fallback search failed: ${error.message}`);
  }
}
