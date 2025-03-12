
import { Application } from "@/types/planning";
import { SpatialSearchParams } from "./types";
import { executeQuery } from "./query-executor";
import { processSpatialSearchResults } from "./results-processor";
import { handleSpatialSearchError } from "./error-handler";

/**
 * Performs a spatial search for planning applications using PostGIS
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any,
  page: number = 0,
  pageSize: number = 50
): Promise<Application[]> {
  try {
    const params: SpatialSearchParams = {
      lat,
      lng,
      radiusKm,
      filters,
      page,
      pageSize
    };
    
    // Execute the query
    const data = await executeQuery(params);
    
    // Process the results (filtering, distance calculation)
    return processSpatialSearchResults(data, lat, lng, filters);
  } catch (error) {
    throw handleSpatialSearchError(error, { lat, lng, radiusKm, filters });
  }
}
