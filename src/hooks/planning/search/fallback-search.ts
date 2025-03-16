
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { useSearchLogger } from "@/hooks/use-search-logger";
import { type PostgrestResponse } from '@supabase/supabase-js';
import { SearchFilters } from "./types";

// This is a fallback search method that uses a simpler bounding box approach
// to find planning applications when the spatial search fails
export const useBoundingBoxSearch = () => {
  const { logSearch, logSearchError } = useSearchLogger();

  const searchByBoundingBox = async (lat: number, lng: number, radius: number, limit = 25) => {
    try {
      // Calculate bounding box coordinates (simple approximation)
      // 1 degree of latitude is approximately 111km
      // 1 degree of longitude varies with latitude, roughly 111km * cos(latitude)
      const degreesLat = radius / 111.0;
      const degreesLng = radius / (111.0 * Math.cos(lat * (Math.PI / 180)));

      const minLat = lat - degreesLat;
      const maxLat = lat + degreesLat;
      const minLng = lng - degreesLng;
      const maxLng = lng + degreesLng;

      // First try the optimized search
      console.log(`Performing fallback search with bounding box: ${minLat},${minLng} to ${maxLat},${maxLng}`);
      
      const query = supabase
        .from('crystal_roof')
        .select(`
          id, latitude, longitude, description, status, 
          address, size, category, created_at, updated_at,
          authority_name, impact_score, title, ref_number, image_url,
          location_image, storybook
        `)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      // Add timeout to query execution
      const response = await withTimeout<PostgrestResponse<any>>(
        query,
        20000,
        'Fallback search timeout'
      );
      
      if (response && 'data' in response && 'error' in response) {
        const { data, error } = response;
        
        if (error) {
          console.error('Error in fallback search:', error);
          logSearchError('bounding-box', 'database_error', JSON.stringify(error));
          return { data: [], error };
        }

        // Process and return results with distance calculations
        if (data && Array.isArray(data)) {
          const resultsWithDistance = data.map(app => {
            const appLat = parseFloat(app.latitude);
            const appLng = parseFloat(app.longitude);
            
            // Calculate distance in kilometers using Haversine formula
            const distance = calculateDistance(lat, lng, appLat, appLng);
            
            return {
              ...app,
              distance,
              distance_miles: distance * 0.621371 // Convert to miles
            };
          });
          
          // Sort by distance
          resultsWithDistance.sort((a, b) => a.distance - b.distance);
          
          return { data: resultsWithDistance, error: null };
        }
      }
      
      return { data: [], error: new Error('Invalid response format from database') };
    } catch (error) {
      console.error('Error in fallback search:', error);
      logSearchError('bounding-box', 'exception', error instanceof Error ? error.message : String(error));
      return { data: [], error };
    }
  };

  return { searchByBoundingBox };
};

// Standalone function for direct use in other modules
export const performFallbackSearch = async (
  lat: number, 
  lng: number, 
  radius: number, 
  filters?: SearchFilters,
  limit = 25
) => {
  try {
    // Calculate bounding box coordinates (simple approximation)
    const degreesLat = radius / 111.0;
    const degreesLng = radius / (111.0 * Math.cos(lat * (Math.PI / 180)));

    const minLat = lat - degreesLat;
    const maxLat = lat + degreesLat;
    const minLng = lng - degreesLng;
    const maxLng = lng + degreesLng;

    console.log(`Performing standalone fallback search with bounding box: ${minLat},${minLng} to ${maxLat},${maxLng}`);
    
    // Build the base query
    let query = supabase
      .from('crystal_roof')
      .select(`
        id, latitude, longitude, description, status, 
        address, size, category, created_at, updated_at,
        authority_name, impact_score, title, ref_number, image_url,
        location_image, storybook
      `)
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('category', filters.type);
      }
    }
    
    // Apply ordering and limit
    query = query.order('updated_at', { ascending: false }).limit(limit);

    // Add timeout to query execution
    const response = await withTimeout<PostgrestResponse<any>>(
      query,
      20000,
      'Fallback search timeout'
    );
    
    if (response && 'data' in response && 'error' in response) {
      const { data, error } = response;
      
      if (error) {
        console.error('Error in fallback search:', error);
        return [];
      }

      // Process and return results with distance calculations
      if (data && Array.isArray(data)) {
        const resultsWithDistance = data.map(app => {
          const appLat = parseFloat(app.latitude);
          const appLng = parseFloat(app.longitude);
          
          // Calculate distance in kilometers using Haversine formula
          const distance = calculateDistance(lat, lng, appLat, appLng);
          
          return {
            ...app,
            distance,
            distance_miles: distance * 0.621371 // Convert to miles
          };
        });
        
        // Sort by distance
        resultsWithDistance.sort((a, b) => a.distance - b.distance);
        
        return resultsWithDistance;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in standalone fallback search:', error);
    return [];
  }
};

// Haversine formula to calculate distance between two points on Earth
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
