
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchCoordinates, SearchResult } from '@/types/search';
import { Application } from '@/types/planning';

// Simple function to call Supabase RPC
async function performSpatialSearch(coordinates: SearchCoordinates): Promise<SearchResult> {
  console.log('🔍 Performing spatial search with coordinates:', coordinates);
  
  const { data, error } = await supabase.rpc('get_nearby_applications', {
    center_lat: coordinates.lat,
    center_lng: coordinates.lng,
    radius_km: 5 // Fixed 5km radius for reliability
  });

  if (error) {
    console.error('❌ Supabase RPC error:', error);
    throw error;
  }

  console.log(`✅ Found ${data?.length || 0} applications`);
  
  return {
    applications: data as Application[],
    method: 'spatial',
    timing: {
      start: Date.now(),
      end: Date.now(),
      duration: 0
    }
  };
}

export function useSpatialSearch(coordinates: SearchCoordinates | null) {
  return useQuery({
    queryKey: ['spatial-search', coordinates],
    queryFn: () => performSpatialSearch(coordinates!),
    enabled: !!coordinates,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
