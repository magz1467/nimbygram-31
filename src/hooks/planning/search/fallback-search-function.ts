
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { type PostgrestResponse } from '@supabase/supabase-js';
import { calculateDistance, kmToMiles } from "../utils/distance-calculator";
import { calculateBoundingBox } from "../utils/bounding-box";
import { SearchFilters } from "./types";

// Cache storage for recent application data
interface CacheEntry {
  data: any[];
  timestamp: number;
}

const applicationCache: Record<string, CacheEntry> = {};
const MAX_CACHE_SIZE = 20;
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Gets a cache key for the results
 */
const getCacheKey = (lat: number, lng: number, radius: number, filters?: SearchFilters): string => {
  return `${lat.toFixed(4)},${lng.toFixed(4)},${radius},${JSON.stringify(filters || {})}`;
};

/**
 * Clears old cache entries
 */
const cleanupCache = () => {
  const now = Date.now();
  Object.keys(applicationCache).forEach(key => {
    if (applicationCache[key].timestamp && now - applicationCache[key].timestamp > CACHE_EXPIRY_MS) {
      delete applicationCache[key];
    }
  });
};

/**
 * Standalone function for performing a fallback bounding box search
 * Used directly by search strategy when spatial search is unavailable
 */
export const performFallbackSearch = async (
  lat: number, 
  lng: number, 
  radius: number, 
  filters?: SearchFilters,
  limit = 25
) => {
  try {
    // Check cache first
    const cacheKey = getCacheKey(lat, lng, radius, filters);
    if (applicationCache[cacheKey]) {
      console.log(`Using cached results for ${cacheKey}`);
      return applicationCache[cacheKey].data;
    }
    
    // Clean up expired cache entries
    cleanupCache();
    
    // Calculate bounding box coordinates
    const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(lat, lng, radius);

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
          
          // Calculate distance in kilometers
          const distance = calculateDistance(lat, lng, appLat, appLng);
          
          return {
            ...app,
            distance,
            distance_miles: kmToMiles(distance)
          };
        });
        
        // Sort by distance
        resultsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Store in cache
        applicationCache[cacheKey] = {
          data: resultsWithDistance,
          timestamp: Date.now()
        };
        
        // Maintain cache size
        if (Object.keys(applicationCache).length > MAX_CACHE_SIZE) {
          // Remove oldest entry
          const oldestKey = Object.keys(applicationCache)
            .sort((a, b) => applicationCache[a].timestamp - applicationCache[b].timestamp)[0];
          delete applicationCache[oldestKey];
        }
        
        return resultsWithDistance;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in standalone fallback search:', error);
    return [];
  }
};
