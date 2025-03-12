
import { Application } from "@/types/planning";
import { executeSpatialQuery } from "./query-executor";
import { SpatialSearchParams } from "./types";

/**
 * Performs a spatial search for planning applications using the paginated RPC function
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any,
  page: number = 0,
  pageSize: number = 50
): Promise<Application[] | null> {
  console.log('Attempting paginated spatial search');
  console.log('Search parameters:', { lat, lng, radiusKm, filters, page, pageSize });
  
  const searchParams: SpatialSearchParams = {
    lat,
    lng,
    radiusKm,
    filters,
    page,
    pageSize
  };
  
  try {
    const results = await executeSpatialQuery(searchParams);
    console.log(`Got ${results.length} spatial search results`);
    return results;
  } catch (error) {
    console.error('Spatial search failed:', error);
    throw error;
  }
}
