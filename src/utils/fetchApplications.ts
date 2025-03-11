
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
    // Try multiple approaches in parallel to ensure we get results
    const [spatialResults, directResults, edgeResults] = await Promise.allSettled([
      // Try the optimized spatial query first
      fetchApplicationsWithSpatialQuery(coordinates, 20),
      
      // Also try direct database query as backup
      fetchApplicationsFromDatabase(coordinates, 30),
      
      // And edge function as a third option
      fetchApplicationsFromEdge(coordinates)
    ]);
    
    console.log('Results from different query methods:', {
      spatial: spatialResults.status === 'fulfilled' ? spatialResults.value.length : 'failed',
      direct: directResults.status === 'fulfilled' ? directResults.value.length : 'failed',
      edge: edgeResults.status === 'fulfilled' ? edgeResults.value.length : 'failed'
    });
    
    // Use the results from whichever method returned data, prioritizing spatial
    if (spatialResults.status === 'fulfilled' && spatialResults.value.length > 0) {
      return spatialResults.value;
    }
    
    if (directResults.status === 'fulfilled' && directResults.value.length > 0) {
      return directResults.value;
    }
    
    if (edgeResults.status === 'fulfilled' && edgeResults.value && edgeResults.value.length > 0) {
      return edgeResults.value;
    }
    
    // If no results from initial radius, try with progressively larger radius
    console.log('No results found with initial queries, trying expanded radius');
    
    const expandedResults = await fetchApplicationsWithSpatialQuery(coordinates, 50);
    if (expandedResults.length > 0) {
      console.log(`Found ${expandedResults.length} results with expanded 50km radius`);
      
      // Add a note to the first result
      if (expandedResults[0]) {
        expandedResults[0].notes = `Showing results up to 50km away as no applications were found closer to your search location.`;
      }
      
      return expandedResults;
    }
    
    // Last resort - try with very large radius
    const wideResults = await fetchApplicationsWithSpatialQuery(coordinates, 100);
    if (wideResults.length > 0) {
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
