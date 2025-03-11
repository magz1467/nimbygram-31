
import { Application } from "@/types/planning";
import { fetchApplicationsWithSpatialQuery } from "./optimizedSearchFetcher";
import { sortApplicationsByDistance, calculateDistance } from "./distance";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  // Validate the coordinates format [lat, lng]
  if (Math.abs(coordinates[0]) > 90) {
    console.error('Invalid latitude in coordinates:', coordinates);
    return [];
  }
  
  console.log('🔍 Fetching applications near coordinates:', coordinates);
  
  try {
    // Try with initial radius
    let results = await fetchApplicationsWithSpatialQuery(coordinates, 20, 50);
    
    // If no results, try with expanded radius
    if (!results || results.length === 0) {
      console.log('No results found with initial radius, trying expanded search');
      results = await fetchApplicationsWithSpatialQuery(coordinates, 50, 75);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} results with expanded 50km radius`);
        results[0].notes = `Showing results up to 50km away as no applications were found closer.`;
      } else {
        // Last attempt with wider radius
        results = await fetchApplicationsWithSpatialQuery(coordinates, 100, 100);
        if (results && results.length > 0) {
          console.log(`Found ${results.length} results with wide 100km radius`);
          results[0].notes = `Showing results up to 100km away as no applications were found closer.`;
        }
      }
    }
    
    // Sort results by distance
    if (results && results.length > 0) {
      return sortApplicationsByDistance(results, coordinates);
    }
    
    return [];
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    // Only throw if we have no results
    throw new Error("Could not fetch applications. Please try again.");
  }
};
