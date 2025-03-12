
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchMethod, SearchParams } from "./types";
import { SearchStage } from "./use-search-state-manager";
import { formatDistance } from "@/utils/distance";

type ProgressCallback = (stage: SearchStage, progress: number) => void;
type MethodCallback = (method: SearchMethod) => void;

/**
 * Simplified central search function using RPC with geometry and a 5km radius
 */
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
  const { coordinates, filters } = searchParams;
  const [lat, lng] = coordinates;
  const radius = 5; // Fixed 5km radius for all searches
  const { onProgress, onMethodChange } = options;
  
  // Start progress
  if (onProgress) onProgress('searching', 20);
  if (onMethodChange) onMethodChange('spatial');

  try {
    console.log(`Executing spatial search at [${lat}, ${lng}] with 5km radius`);
    
    // Use the paginated RPC function with a 30-second timeout
    const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radius,
      page_number: 0,
      page_size: 100
    }, { count: 'exact', headers: { 'Prefer': 'count=exact' } })
    .timeout(30000); // 30-second timeout

    if (error) {
      console.error("RPC search error:", error);
      throw error;
    }

    if (onProgress) onProgress('processing', 70);

    // Filter results if needed
    let applications = data || [];
    if (filters && Object.keys(filters).length > 0) {
      applications = applications.filter(app => {
        if (filters.status && app.status && !app.status.toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
        if (filters.type && app.type && !app.type.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }
        if (filters.classification && app.classification && 
            !app.classification.toLowerCase().includes(filters.classification.toLowerCase())) {
          return false;
        }
        return true;
      });
    }

    // Add formatted distance
    applications = applications.map(app => {
      if (!app.distance_km && app.latitude && app.longitude) {
        // If distance is not already calculated by the database function
        const R = 6371; // Earth's radius in km
        const dLat = (app.latitude - lat) * Math.PI / 180;
        const dLon = (app.longitude - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(app.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        app.distance_km = distance;
      }
      
      return {
        ...app,
        distance: app.distance || formatDistance(app.distance_km || 0),
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    });

    // Sort by distance
    applications.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

    if (onProgress) onProgress('complete', 100);
    
    console.log(`Search completed, found ${applications.length} results`);
    
    return {
      applications,
      method: 'spatial'
    };
    
  } catch (error) {
    console.error("Search failed:", error);
    if (onProgress) onProgress('error', 100);
    throw error;
  }
}
