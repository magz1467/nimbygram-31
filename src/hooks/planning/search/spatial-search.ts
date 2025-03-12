
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications
 * This is a stub function that immediately returns null since the RPC function doesn't exist
 * When the RPC function is created, this can be updated to use it
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  // Immediately return null without attempting to call a non-existent function
  console.log('Spatial search skipped - RPC function not available');
  return null;
}
