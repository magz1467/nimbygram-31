
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchMethod, SearchParams } from "./types";
import { SearchStage } from "./use-search-state-manager";
import { formatDistance } from "@/utils/distance";

type ProgressCallback = (stage: SearchStage, progress: number) => void;
type MethodCallback = (method: SearchMethod) => void;

/**
 * Simplified central search function using RPC with a fixed 5km radius
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

  // Create an AbortController for timeout management
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log(`Executing spatial search at [${lat}, ${lng}] with 5km radius`);
    
    // Use the paginated RPC function
    const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radius,
      page_number: 0,
      page_size: 100
    }, { 
      count: 'exact'
    });

    // Clear the timeout if we got a response
    clearTimeout(timeoutId);

    // Check if the search was aborted
    if (controller.signal.aborted) {
      console.error("Search timed out after 30 seconds");
      throw new Error('Search timeout after 30 seconds');
    }

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

    // Process all results in a single operation
    applications = applications.map(app => {
      let distance_km = app.distance_km;
      if (!distance_km && app.latitude && app.longitude) {
        const R = 6371; // Earth's radius in km
        const dLat = (app.latitude - lat) * Math.PI / 180;
        const dLon = (app.longitude - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(app.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance_km = R * c;
      }
      
      return {
        ...app,
        distance_km,
        distance: app.distance || formatDistance(distance_km || 0),
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    });

    // Sort by distance once
    applications.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

    if (onProgress) onProgress('complete', 100);
    
    console.log(`Search completed, found ${applications.length} results`);
    
    return {
      applications,
      method: 'spatial'
    };
    
  } catch (error) {
    // Clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
    
    // Check if this was an abort error
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error("Search timed out after 30 seconds");
      if (onProgress) onProgress('complete', 100); // Use valid 'complete' stage instead of 'error'
      throw new Error('Search timeout after 30 seconds');
    }
    
    console.error("Search failed:", error);
    if (onProgress) onProgress('complete', 100); // Use valid 'complete' stage instead of 'error'
    throw error;
  }
}
