
import { Application } from "@/types/planning";
import { performFallbackSearch } from "../fallback-search";
import { ProgressiveSearchParams } from "./types";

export async function performQuickSearch(
  params: ProgressiveSearchParams,
  quickSearchRadiusFactor: number = 0.5
): Promise<Application[]> {
  try {
    const { coordinates, searchRadius, filters } = params;
    const [lat, lng] = coordinates;
    
    // Calculate a reduced radius for quick search
    const quickSearchRadius = Math.max(1, Math.floor(searchRadius * quickSearchRadiusFactor));
    
    console.log(`Performing quick search with radius: ${quickSearchRadius}km`);
    
    // Use fallback search for speed, but with reduced radius
    const quickResults = await performFallbackSearch(lat, lng, quickSearchRadius, filters);
    
    if (quickResults.length > 0) {
      console.log(`Quick search found ${quickResults.length} results`);
      return quickResults;
    }
    
    console.log('Quick search found no results');
    return [];
  } catch (err) {
    console.error('Quick search error:', err);
    return [];
  }
}
