
import { Application } from "@/types/planning";
import { fetchEdgeApplications } from "./fetchEdgeApplications";
import { fetchDirectApplications } from "./fetchDirectApplications";
import { handleApplicationFetchError } from "./applicationErrors";

/**
 * Fetches planning applications based on coordinates
 * First attempts to use the edge function, then falls back to direct query if that fails
 * @param coordinates - Search coordinates [lat, lng]
 * @returns Array of Application objects
 */
export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  try {
    // First, try to fetch from the edge function which has better timeout handling
    try {
      return await fetchEdgeApplications(coordinates);
    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge function failed, falling back to direct query:', edgeFunctionError);
      // Continue to fallback method
    }
    
    // Fallback to direct query with a timeout
    return await fetchDirectApplications(coordinates);
    
  } catch (err: any) {
    return handleApplicationFetchError(err);
  }
};
