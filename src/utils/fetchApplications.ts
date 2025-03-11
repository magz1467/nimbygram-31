
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";
import { fetchApplicationsWithSpatialQuery } from "./optimizedSearchFetcher";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
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
    
    // Use the results from whichever method returned most data
    if (validResults.length > 0) {
      // Sort by array length to get the one with most results
      validResults.sort((a, b) => b.length - a.length);
      return validResults[0];
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
    toast({
      title: "No Nearby Results",
      description: "We couldn't find any planning applications near this location. It may be outside our coverage area or have no recent planning activity.",
      variant: "destructive",
    });
    
    return [];
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    
    // Show toast to the user
    toast({
      title: "Search Error",
      description: "We're having trouble loading the results. Please try again later.",
      variant: "destructive",
    });
    
    // Return empty array to avoid crashing the UI
    return [];
  }
};
