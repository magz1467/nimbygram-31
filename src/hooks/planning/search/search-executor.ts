
import { performSpatialSearch } from "./spatial-search";
import { performFallbackSearch } from "./fallback-search";
import { SearchMethod } from "./types";
import { Application } from "@/types/planning";

/**
 * Executes a search using the best available method
 */
export async function executeSearch(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: any,
  page: number = 0,
  pageSize: number = 50
): Promise<{
  applications: Application[],
  method: SearchMethod
}> {
  try {
    // First try spatial search (more efficient)
    const spatialResults = await performSpatialSearch(lat, lng, radiusKm, filters, page, pageSize);
    
    return {
      applications: spatialResults,
      method: SearchMethod.SPATIAL
    };
  } catch (spatialError) {
    console.warn('Spatial search failed, falling back to bounding box search:', spatialError);
    
    // Fall back to regular search
    const fallbackResults = await performFallbackSearch(lat, lng, radiusKm, filters, page, pageSize);
    
    return {
      applications: fallbackResults,
      method: SearchMethod.FALLBACK
    };
  }
}
