
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";

/**
 * Fallback search using bounding box when PostGIS is not available
 */
export const performFallbackSearch = async (
  lat: number,
  lng: number,
  radius: number = 5,
  filters: any = {}
): Promise<Application[]> => {
  console.log(`🔍 Performing fallback search near [${lat}, ${lng}] with radius ${radius}km`);
  
  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    console.error(`🔍 Invalid coordinates for fallback search: [${lat}, ${lng}]`);
    return [];
  }
  
  try {
    // Calculate bounding box (simple approximation)
    const kmPerDegree = 111.32;
    const latDiff = radius / kmPerDegree;
    const lngDiff = radius / (kmPerDegree * Math.cos(lat * Math.PI / 180));
    
    // Build query with geographic bounds
    let query = supabase
      .from('crystal_roof')
      .select('*')  // Explicitly select all fields including storybook
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(100);
    
    // Apply any filters
    if (filters && Object.keys(filters).length > 0) {
      if (filters.status) {
        query = query.ilike('status', `%${filters.status}%`);
      }
      
      if (filters.type) {
        query = query.ilike('type', `%${filters.type}%`);
      }
    }
    
    // Add a timeout for the query
    const queryPromise = query;
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15 seconds'));
      }, 15000);
    });
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    if (result.error) {
      console.error('Fallback search error:', result.error);
      throw result.error;
    }
    
    console.log(`✅ Fallback search found ${result.data?.length || 0} applications`);
    console.log(`✅ Search was performed at [${lat}, ${lng}] with radius ${radius}km`);
    
    // Check if storybook data is present in the first result
    if (result.data && result.data.length > 0) {
      console.log('First fallback result storybook check:', {
        hasStorybook: Boolean(result.data[0].storybook),
        id: result.data[0].id
      });
    }
    
    return transformApplicationsData(result.data || []);
  } catch (err) {
    console.error('Error in fallback search:', err);
    // Return empty array instead of throwing to prevent cascading errors
    return [];
  }
};
