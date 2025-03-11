
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a manual bounding box search as a fallback when spatial search is unavailable
 * With improved performance and error handling
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: SearchFilters
): Promise<Application[]> {
  console.log('Falling back to manual bounding box search');
  
  // Create base query
  let query = supabase
    .from('crystal_roof')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);
  
  // Calculate bounding box (with more precise calculations)
  const latDegPerKm = 1 / 111;
  const lngDegPerKm = 1 / (111 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - (radiusKm * latDegPerKm);
  const latMax = lat + (radiusKm * latDegPerKm);
  const lngMin = lng - (radiusKm * lngDegPerKm);
  const lngMax = lng + (radiusKm * lngDegPerKm);
  
  // Add location filter - use parameterized queries for better performance
  query = query
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax);
  
  // Add optional filters
  if (filters.status) {
    query = query.ilike('status', `%${filters.status}%`);
  }
  
  if (filters.type) {
    // Simplify type filtering to improve query performance
    query = query.or(`type.ilike.%${filters.type}%`);
  }
  
  if (filters.classification) {
    query = query.ilike('class_3', `%${filters.classification}%`);
  }
  
  try {
    // Add a strict limit to prevent timeouts
    const { data, error } = await query.limit(100).timeout(10000);
    
    if (error) {
      console.error('Supabase query error:', error);
      
      // Handle timeout errors with a more specific error
      if (error.code === '57014' || (error.message && error.message.includes('timeout'))) {
        throw new Error('The search took too long to complete. Please try a more specific location or different filters.');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found for the search criteria');
      return [];
    }
    
    // Calculate distance for each application and sort by distance
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
    return results;
  } catch (error) {
    console.error('Error in fallback search:', error);
    // Rethrow with more context to aid debugging
    throw new Error(`Fallback search failed: ${error.message}`);
  }
}
