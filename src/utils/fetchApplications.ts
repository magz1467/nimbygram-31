
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchApplicationsFromEdge } from "./edgeFunctionFetcher";
import { fetchApplicationsFromDatabase } from "./directDatabaseFetcher";

/**
 * Fetches a single page of applications using both fetching methods
 */
export const fetchApplicationsPage = async (
  coordinates: [number, number] | null,
  page = 0,
  pageSize = 25
): Promise<{ 
  applications: Application[]; 
  hasMore: boolean;
  totalCount: number;
}> => {
  if (!coordinates) {
    console.log('❌ fetchApplicationsPage: No coordinates provided');
    return { applications: [], hasMore: false, totalCount: 0 };
  }
  
  console.log(`🔍 Fetching page ${page} with size ${pageSize} of applications near:`, coordinates);
  
  try {
    // Try both fetching methods simultaneously to maximize results
    console.log('Starting both edge function and direct database queries in parallel...');
    
    const [edgeResults, dbResults] = await Promise.all([
      fetchApplicationsFromEdge(coordinates, pageSize, page).catch(err => {
        console.warn('⚠️ Edge function failed:', err);
        return null;
      }),
      fetchApplicationsFromDatabase(coordinates, pageSize, page).catch(err => {
        console.warn('⚠️ Direct database query failed:', err);
        return { applications: [], hasMore: false, totalCount: 0 };
      })
    ]);
    
    console.log(`Edge function returned ${edgeResults?.applications.length || 0} results`);
    console.log(`Direct database query returned ${dbResults.applications.length} results`);
    
    // Choose the source with more results
    const useEdgeResults = edgeResults && edgeResults.applications.length >= dbResults.applications.length;
    let resultSet = useEdgeResults ? edgeResults : dbResults;
    
    // If neither returned results, show an error
    if ((!edgeResults || edgeResults.applications.length === 0) && dbResults.applications.length === 0) {
      console.warn('⚠️ No applications found from either source');
      toast({
        title: "No Results Found",
        description: "We couldn't find any planning applications in this area. Please try searching for a different location.",
        variant: "destructive",
      });
      return { applications: [], hasMore: false, totalCount: 0 };
    }
    
    console.log(`Using ${useEdgeResults ? 'edge' : 'database'} results for this page`);
    
    return {
      applications: resultSet.applications,
      hasMore: resultSet.hasMore,
      totalCount: resultSet.totalCount
    };
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplicationsPage:', err);
    
    // Add specific error handling for timeout errors
    const errorStr = String(err);
    if (errorStr.includes('timeout') || errorStr.includes('57014') || errorStr.includes('statement canceled')) {
      toast({
        title: "Search Timeout",
        description: "The search took too long to complete. Please try a more specific location.",
        variant: "destructive",
      });
    } else {
      // Show generic error toast for other errors
      toast({
        title: "Search Error",
        description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again.",
        variant: "destructive",
      });
    }
    
    // Return empty results
    return { applications: [], hasMore: false, totalCount: 0 };
  }
};

/**
 * Legacy function to fetch all applications - redirects to the new paginated approach
 */
export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    return [];
  }
  
  console.log('Legacy fetchApplications called, using paginated approach with page 0');
  
  try {
    const result = await fetchApplicationsPage(coordinates, 0, 25);
    return result.applications;
  } catch (error) {
    console.error('Error in legacy fetchApplications:', error);
    return [];
  }
};
