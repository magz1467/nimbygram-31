
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult, SEARCH_TIMEOUT } from '@/types/search';
import { Application } from '@/types/planning';
import { withTimeout } from '@/utils/coordinates/timeout-handler';

// More robust function to call Supabase RPC with improved error handling
async function performSpatialSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  console.log('🔍 Performing spatial search with coordinates:', coordinates);
  
  const startTime = Date.now();
  
  try {
    // Use the withTimeout utility to prevent long-running queries
    const { data, error } = await withTimeout(
      supabase.rpc('get_nearby_applications', {
        center_lat: coordinates.lat,
        center_lng: coordinates.lng,
        radius_km: 10 // Increased to 10km radius for better results
      }),
      SEARCH_TIMEOUT,
      'Spatial search timed out after 30 seconds'
    );

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      throw error;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Found ${data?.length || 0} applications in ${duration}ms`);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No results found, might need to increase search radius');
    }
    
    const applications = data as Application[];
    
    // Enhance applications with distance information
    const enhancedApplications = applications.map(app => {
      if (app.latitude && app.longitude) {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          coordinates.lat, 
          coordinates.lng,
          app.latitude,
          app.longitude
        );
        
        return {
          ...app,
          distance: `${distance.toFixed(1)}km`,
          coordinates: [app.latitude, app.longitude] as [number, number]
        };
      }
      return app;
    });
    
    return {
      applications: enhancedApplications,
      method: 'spatial',
      timing: {
        start: startTime,
        end: endTime,
        duration
      }
    };
  } catch (error) {
    console.error('❌ Spatial search failed:', error);
    throw error;
  }
}

// Simple Haversine formula distance calculator
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useSpatialSearch(coordinates: SearchCoordinates | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => {
      if (!coordinates) {
        throw new Error('No coordinates provided for spatial search');
      }
      return performSpatialSearch(coordinates);
    },
    enabled: !!coordinates,
    retry: 3, // Increased retries
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
