
import { performSpatialSearch } from "./spatial-search";
import { performFallbackSearch } from "./fallback-search";
import { SearchMethod, SearchParams } from "./types";
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";
import { SearchStage } from "./use-search-state-manager";

// Define the search strategy interface
interface SearchStrategy {
  name: SearchMethod;
  execute: (params: SearchParams) => Promise<Application[]>;
}

// Create search strategies
const searchStrategies: SearchStrategy[] = [
  {
    name: 'paginated',
    execute: async (params: SearchParams): Promise<Application[]> => {
      const { coordinates, radius, filters } = params;
      const [lat, lng] = coordinates;
      
      console.log('Executing paginated RPC search strategy');
      const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
        center_lat: lat,
        center_lng: lng,
        radius_km: Math.min(radius, 10), // Cap at 10km
        page_number: params.page || 0,
        page_size: params.pageSize || 10
      });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      return data;
    }
  },
  {
    name: 'spatial',
    execute: async (params: SearchParams): Promise<Application[]> => {
      const { coordinates, radius, filters } = params;
      const [lat, lng] = coordinates;
      
      console.log('Executing spatial search strategy');
      return await performSpatialSearch(lat, lng, Math.min(radius, 10), filters);
    }
  },
  {
    name: 'fallback',
    execute: async (params: SearchParams): Promise<Application[]> => {
      const { coordinates, radius, filters } = params;
      const [lat, lng] = coordinates;
      
      console.log('Executing fallback search strategy');
      return await performFallbackSearch(lat, lng, Math.min(radius, 10), filters);
    }
  },
  {
    name: 'emergency',
    execute: async (params: SearchParams): Promise<Application[]> => {
      const { coordinates, radius } = params;
      const [lat, lng] = coordinates;
      const smallRadius = Math.min(radius * 0.2, 1); // 20% of original radius or max 1km
      
      console.log('Executing emergency limited search strategy');
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('id, title, address, latitude, longitude, status')
        .gte('latitude', lat - (smallRadius/111.0))
        .lte('latitude', lat + (smallRadius/111.0))
        .gte('longitude', lng - (smallRadius/(111.0 * Math.cos(Math.PI * lat/180))))
        .lte('longitude', lng + (smallRadius/(111.0 * Math.cos(Math.PI * lat/180))))
        .limit(10);
        
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      return data;
    }
  }
];

type ProgressCallback = (stage: SearchStage, progress: number) => void;
type MethodCallback = (method: SearchMethod) => void;

export async function executeSearch(
  searchParams: SearchParams,
  options: {
    onProgress?: ProgressCallback,
    onMethodChange?: MethodCallback
  } = {}
): Promise<{
  applications: Application[],
  method: SearchMethod
}> {
  const { onProgress, onMethodChange } = options;
  let currentProgress = 20; // Start at 20% (assuming coordinates are already resolved)
  const progressStep = 60 / searchStrategies.length; // Distribute 60% of progress across strategies
  
  for (let i = 0; i < searchStrategies.length; i++) {
    const strategy = searchStrategies[i];
    
    try {
      if (onProgress) {
        onProgress('searching', currentProgress);
        currentProgress += progressStep / 2; // Update progress before attempt
      }
      
      console.log(`Attempting search with ${strategy.name} strategy (${i+1}/${searchStrategies.length})`);
      if (onMethodChange) {
        onMethodChange(strategy.name);
      }
      
      const applications = await strategy.execute(searchParams);
      
      if (applications.length > 0) {
        if (onProgress) {
          onProgress('processing', 80);
        }
        
        console.log(`${strategy.name} search successful, found ${applications.length} results`);
        
        return {
          applications,
          method: strategy.name
        };
      }
      
      console.log(`${strategy.name} search returned no results, trying next strategy`);
      if (onProgress) {
        currentProgress += progressStep / 2; // Update progress after attempt
      }
    } catch (error) {
      console.warn(`${strategy.name} search failed:`, error);
      if (onProgress) {
        currentProgress += progressStep / 2; // Update progress after failure
      }
      // Continue to next strategy
    }
  }
  
  throw new Error("All search strategies failed");
}
