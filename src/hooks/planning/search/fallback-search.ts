
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationsData } from "@/utils/transforms/application-transformer";
import { withTimeout } from "@/utils/fetchUtils";

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
    
    // Determine if this is likely a large area search
    const isLargeArea = radius > 3 || (latDiff * lngDiff > 0.01);
    console.log(`🔍 Area analysis: isLargeArea=${isLargeArea}, coverage=${latDiff * lngDiff} sq degrees`);
    
    // For large areas, we'll use a smaller limit initially to ensure fast results
    const resultLimit = isLargeArea ? 25 : 100;
    
    // Build query with geographic bounds
    let query = supabase
      .from('crystal_roof')
      .select('*')  // Explicitly select all fields including storybook
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(resultLimit);
    
    // Apply any filters
    if (filters && Object.keys(filters).length > 0) {
      if (filters.status) {
        query = query.ilike('status', `%${filters.status}%`);
      }
      
      if (filters.type) {
        query = query.ilike('type', `%${filters.type}%`);
      }
    }
    
    // Set an appropriate timeout
    const timeout = isLargeArea ? 8000 : 15000; // 8 seconds for large areas, 15 for smaller
    
    // Execute query with timeout - convert query to promise first
    const result = await withTimeout(
      query,
      timeout,
      `Search timeout reached after ${timeout/1000} seconds. Some results may be available.`
    );
    
    // Now we can safely access data and error properties
    const { data, error } = result;
    
    if (error) {
      // For timeout errors, we might still have partial results
      if (error.message.includes('timeout')) {
        console.log('Timeout in fallback search, but we might have partial results');
        if (!data) {
          console.error('Fallback search timeout error with no data:', error);
          return [];
        }
        // Continue with partial results
      } else {
        console.error('Fallback search error:', error);
        throw error;
      }
    }
    
    console.log(`✅ Fallback search found ${data?.length || 0} applications`);
    
    // Calculate distance for each result for better sorting
    const results = (data || []).map(app => {
      // Simple haversine distance calculation
      const R = 6371; // Earth radius in km
      const dLat = (app.latitude - lat) * Math.PI / 180;
      const dLon = (app.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(app.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return {
        ...app,
        distance // Add distance in km
      };
    });
    
    // Sort by distance
    results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    
    // Check if storybook data is present in the first result
    if (results && results.length > 0) {
      console.log('First fallback result storybook check:', {
        hasStorybook: Boolean(results[0].storybook),
        id: results[0].id,
        distance: results[0].distance
      });
      
      if (results[0].storybook) {
        console.log(`Storybook preview: ${results[0].storybook.substring(0, 100)}...`);
      }
    }
    
    return transformApplicationsData(results);
  } catch (err) {
    console.error('Error in fallback search:', err);
    return [];
  }
};
