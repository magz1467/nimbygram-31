
import { Application } from "@/types/planning";
import { fetchApplicationsWithSpatialQuery } from "./optimizedSearchFetcher";
import { sortApplicationsByDistance, calculateDistance } from "./distance";
import { fetchNearbyApplications } from "@/services/applications/fetch-nearby-applications";
import { transformApplicationData } from "./transforms/application-transformer";

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
    // First try optimized spatial query
    let results = await fetchApplicationsWithSpatialQuery(coordinates, 20, 50);
    
    // If no results from optimized query, try with expanded radius
    if (!results || results.length === 0) {
      console.log('No results found with initial optimized query, trying expanded search');
      results = await fetchApplicationsWithSpatialQuery(coordinates, 50, 75);
      
      if (results && results.length > 0) {
        console.log(`Found ${results.length} results with expanded 50km radius`);
        if (results[0]) {
          results[0].notes = `Showing results up to 50km away as no applications were found closer.`;
        }
      } else {
        // Last attempt with wider radius
        results = await fetchApplicationsWithSpatialQuery(coordinates, 100, 100);
        if (results && results.length > 0) {
          console.log(`Found ${results.length} results with wide 100km radius`);
          if (results[0]) {
            results[0].notes = `Showing results up to 100km away as no applications were found closer.`;
          }
        } else {
          // If still no results, try the direct fetch method as last resort
          console.log('No results from optimized query, falling back to direct fetch method');
          const directResults = await fetchNearbyApplications(coordinates, 50);
          
          if (directResults && directResults.length > 0) {
            console.log(`Found ${directResults.length} results using direct fetch method`);
            
            // Transform raw data to Application objects
            const transformedApplications = directResults
              .filter((app) => app != null) // Filter out null entries
              .map(app => transformApplicationData(app, coordinates))
              .filter((app): app is Application => app !== null);
            
            // Sort by distance
            results = sortApplicationsByDistance(transformedApplications, coordinates);
            
            if (results[0]) {
              results[0].notes = `Found ${results.length} planning applications near this location.`;
            }
          }
        }
      }
    }
    
    // Make sure results is an array
    if (!Array.isArray(results)) {
      console.warn('Results is not an array, returning empty array');
      return [];
    }
    
    // Sort results by distance (redundant but ensuring it's always done)
    if (results && results.length > 0) {
      return sortApplicationsByDistance(results, coordinates);
    }
    
    return [];
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    // Return empty array instead of throwing to prevent UI from crashing
    return [];
  }
};
