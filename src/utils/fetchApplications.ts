import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";
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
    // Try multiple approaches in parallel with lower result limits for faster performance
    const results = await Promise.allSettled([
      // Try the optimized spatial query first with smaller result set
      fetchApplicationsWithSpatialQuery(coordinates, 20, 50),
      
      // Also try direct database query as backup with smaller result set
      fetchApplicationsFromDatabase(coordinates, 30),
      
      // And edge function as a third option
      fetchApplicationsFromEdge(coordinates)
    ]);
    
    // Extract successful results and filter out null/empty arrays
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<Application[]> => 
        result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<Application[]>).value)
      .filter(apps => Array.isArray(apps) && apps.length > 0);
    
    console.log('Results from different query methods:', {
      count: validResults.length,
      sizes: validResults.map(r => r.length)
    });
    
    // NEW: Instead of just using the largest result set, we'll pick the best one
    // that's properly sorted by distance
    if (validResults.length > 0) {
      // Sort each result set to ensure proper distance ordering
      const properlyOrderedResults = validResults.map(apps => 
        sortApplicationsByDistance([...apps], coordinates)
      );
      
      // Use the results that have the most entries in the nearest 10km
      const resultsWithNearbyCount = properlyOrderedResults.map(apps => {
        const nearbyCount = apps.filter(app => {
          if (!app.coordinates) return false;
          const distance = calculateDistance(coordinates, app.coordinates);
          return distance <= 10; // Within 10km
        }).length;
        
        return { apps, nearbyCount };
      });
      
      // Sort by nearby count first, then by total size
      resultsWithNearbyCount.sort((a, b) => {
        if (a.nearbyCount !== b.nearbyCount) {
          return b.nearbyCount - a.nearbyCount; // More nearby results first
        }
        return b.apps.length - a.apps.length; // Then by total size
      });
      
      console.log('Sorted result sets by nearby results:', 
        resultsWithNearbyCount.map(r => ({ 
          nearbyCount: r.nearbyCount, 
          totalCount: r.apps.length 
        }))
      );
      
      // Return the best result set
      if (resultsWithNearbyCount[0]) {
        return resultsWithNearbyCount[0].apps;
      }
    }
    
    // If no results from initial radius, try with progressively larger radius
    console.log('No results found with initial queries, trying expanded radius');
    
    const expandedResults = await fetchApplicationsWithSpatialQuery(coordinates, 50, 75);
    if (expandedResults && expandedResults.length > 0) {
      console.log(`Found ${expandedResults.length} results with expanded 50km radius`);
      
      // Add a note to the first result
      if (expandedResults[0]) {
        expandedResults[0].notes = `Showing results up to 50km away as no applications were found closer to your search location.`;
      }
      
      return expandedResults;
    }
    
    // Last resort - try with very large radius
    const wideResults = await fetchApplicationsWithSpatialQuery(coordinates, 100, 100);
    if (wideResults && wideResults.length > 0) {
      console.log(`Found ${wideResults.length} results with wide 100km radius`);
      
      // Add a note to the first result
      if (wideResults[0]) {
        wideResults[0].notes = `Showing results up to 100km away as no applications were found closer to your search location.`;
      }
      
      return wideResults;
    }
    
    // If still no results, show appropriate message
    console.warn('⚠️ No applications found even with expanded radius');
    return [];
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    
    // Only show error toast if we have no application data
    // This prevents showing errors when we actually have results
    return [];
  }
};
