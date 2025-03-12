import { performSpatialSearch } from "./spatial-search";
import { performFallbackSearch } from "./fallback-search";
import { SearchMethod, SearchParams } from "./types";
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";

export async function executeSearch(
  searchParams: SearchParams,
  searchMethodRef?: React.MutableRefObject<SearchMethod | null>
): Promise<{
  applications: Application[],
  method: SearchMethod
}> {
  try {
    // Extract parameters from the search params
    const { coordinates, radius, filters } = searchParams;
    const [lat, lng] = coordinates;
    
    // Always try paginated RPC function first - it's optimized for large datasets
    try {
      console.log('Attempting paginated spatial search...');
      const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
        center_lat: lat,
        center_lng: lng,
        radius_km: Math.min(radius, 10), // Cap at 10km
        page_number: 0,
        page_size: 10
      });
      
      if (error) {
        console.warn('Paginated search failed:', error.message);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Paginated search successful, found ${data.length} results`);
        
        if (searchMethodRef) {
          searchMethodRef.current = 'paginated';
        }
        
        return {
          applications: data,
          method: 'paginated'
        };
      }
      
      console.log('Paginated search returned no results, trying spatial search');
    } catch (paginatedError) {
      console.warn('Paginated search error:', paginatedError);
    }
    
    // For non-high-density areas, try normal spatial search with reasonable radius
    try {
      const adjustedRadius = Math.min(radius, 10); // Cap at 10km
      const spatialResults = await performSpatialSearch(lat, lng, adjustedRadius, filters);
      
      if (searchMethodRef) {
        searchMethodRef.current = 'spatial';
      }
      
      return {
        applications: spatialResults,
        method: 'spatial'
      };
    } catch (spatialError) {
      console.warn('Spatial search failed, falling back to bounding box search:', spatialError);
      
      // Use fallback search with capped radius
      const fallbackResults = await performFallbackSearch(lat, lng, Math.min(radius, 10), filters);
      
      if (searchMethodRef) {
        searchMethodRef.current = 'fallback';
      }
      
      return {
        applications: fallbackResults,
        method: 'fallback'
      };
    }
  } catch (error) {
    console.error('All search methods failed:', error);
    
    // If everything else failed, try a very basic query with limited scope
    try {
      console.log('Attempting emergency limited search...');
      
      const { coordinates, radius } = searchParams;
      const [lat, lng] = coordinates;
      const smallRadius = Math.min(radius * 0.2, 1); // 20% of original radius or max 1km
      
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('id, title, address, latitude, longitude, status')
        .gte('latitude', lat - (smallRadius/111.0))
        .lte('latitude', lat + (smallRadius/111.0))
        .gte('longitude', lng - (smallRadius/(111.0 * Math.cos(Math.PI * lat/180))))
        .lte('longitude', lng + (smallRadius/(111.0 * Math.cos(Math.PI * lat/180))))
        .limit(10);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Emergency search found ${data.length} results`);
        
        if (searchMethodRef) {
          searchMethodRef.current = 'emergency';
        }
        
        return {
          applications: data,
          method: 'emergency'
        };
      }
    } catch (emergencyError) {
      console.error('Emergency search also failed:', emergencyError);
    }
    
    throw error;
  }
}

/**
 * Check if the coordinates are in a known high-density area
 * that requires special handling
 */
function isKnownProblematicLocation(lat: number, lng: number): boolean {
  // HP22 6JJ area (Wendover, Buckinghamshire)
  const isHp226jjArea = 
    lat >= 51.755 && lat <= 51.775 && 
    lng >= -0.755 && lng <= -0.735;
    
  // Amersham area (known to have many planning applications)
  const isAmershamArea = 
    lat >= 51.65 && lat <= 51.68 && 
    lng >= -0.63 && lng <= -0.57;
    
  // Bath city center (known to have many planning applications)
  const isBathCityCenter =
    lat >= 51.37 && lat <= 51.39 && 
    lng >= -2.37 && lng <= -2.34;
  
  return isHp226jjArea || isAmershamArea || isBathCityCenter;
}
