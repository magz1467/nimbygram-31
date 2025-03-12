
import { performSpatialSearch } from "./spatial-search";
import { performFallbackSearch } from "./fallback-search";
import { SearchMethod, SearchParams, SearchOptions } from "./types";
import { Application } from "@/types/planning";

/**
 * Executes a search using the best available method
 */
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
    
    // First try spatial search (more efficient)
    const spatialResults = await performSpatialSearch(lat, lng, radius, filters);
    
    // Update the search method reference if provided
    if (searchMethodRef) {
      searchMethodRef.current = 'spatial';
    }
    
    return {
      applications: spatialResults,
      method: 'spatial'
    };
  } catch (spatialError) {
    console.warn('Spatial search failed, falling back to bounding box search:', spatialError);
    
    // Extract parameters from the search params
    const { coordinates, radius, filters } = searchParams;
    const [lat, lng] = coordinates;
    
    // Fall back to regular search
    const fallbackResults = await performFallbackSearch(lat, lng, radius, filters);
    
    // Update the search method reference if provided
    if (searchMethodRef) {
      searchMethodRef.current = 'fallback';
    }
    
    return {
      applications: fallbackResults,
      method: 'fallback'
    };
  }
}
