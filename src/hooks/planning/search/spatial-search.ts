
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType, safeStringify } from "@/utils/errors/types";

export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any,
  page: number = 0,
  pageSize: number = 50
): Promise<Application[] | null> {
  try {
    console.log('Attempting paginated spatial search');
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw createAppError('Invalid coordinates for spatial search', null, {
        type: ErrorType.COORDINATES,
        context: { lat, lng, radiusKm },
        userMessage: 'We couldn\'t perform the search with the provided location.'
      });
    }

    const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      page_number: page,
      page_size: pageSize
    });
    
    if (error) {
      console.error('Spatial search error:', error);
      throw createAppError(`Spatial search error: ${error.message}`, error, {
        type: ErrorType.DATABASE,
        context: { lat, lng, radiusKm, filters },
        userMessage: 'We encountered an issue with the search. Please try again.'
      });
    }
    
    if (!data) return [];
    
    // Apply filters and add distance calculations
    const results = data
      .filter((app: any) => {
        if (!app.latitude || !app.longitude) return false;
        
        // Apply additional filters
        if (filters?.status && !app.status?.toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
        if (filters?.type && !app.type?.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }
        return true;
      })
      .map((app: any) => {
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        return {
          ...app,
          distance: `${(distanceKm * 0.621371).toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
        };
      });

    return results;
    
  } catch (error) {
    if (error.name === 'AppError') throw error;
    
    const isTimeout = String(error).toLowerCase().includes('timeout');
    throw createAppError(
      `Spatial search failed: ${safeStringify(error)}`,
      error,
      {
        type: isTimeout ? ErrorType.TIMEOUT : ErrorType.DATABASE,
        context: { lat, lng, radiusKm, filters },
        userMessage: isTimeout 
          ? 'The search took too long. Please try a smaller area.'
          : 'We encountered an issue with the search. Please try again.'
      }
    );
  }
}
