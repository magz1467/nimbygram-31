
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
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
    
    console.log(`✅ Fallback search found ${data?.length || 0} applications`);
    
    // Check if storybook data is present in the first result
    if (data && data.length > 0) {
      console.log('First fallback result storybook check:', {
        hasStorybook: Boolean(data[0].storybook),
        id: data[0].id
      });
      
      if (data[0].storybook) {
        console.log(`Storybook preview: ${data[0].storybook.substring(0, 100)}...`);
      }
    }
    
    return transformApplicationsData(data || []);
  } catch (err) {
    console.error('Error in fallback search:', err);
    return [];
  }
};
