
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchSpatialApplications } from "@/services/applications/fetch-spatial-applications";
import { sortApplicationsByDistance } from "@/utils/distance";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications near coordinates:', coordinates);
  
  try {
    // Use our single source of truth for application fetching
    const { applications } = await fetchSpatialApplications({
      coordinates,
      radiusKm: 10, // Default radius of 10km
      page: 0,
      pageSize: 50 // Fetch a reasonable number of results initially
    });
    
    if (applications.length === 0) {
      console.warn('⚠️ No applications found');
      toast({
        title: "No Results Found",
        description: "We couldn't find any planning applications in this area. Please try searching for a different location.",
        variant: "destructive",
      });
    }
    
    // Sort by distance to ensure closest applications are first
    const sortedApplications = sortApplicationsByDistance(applications, coordinates);
    
    console.log(`✅ Total applications: ${sortedApplications.length}`);
    
    return sortedApplications;
    
  } catch (err: any) {
    console.error('❌ Error in fetchApplications:', err);
    
    toast({
      title: "Search Error",
      description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again.",
      variant: "destructive",
    });
    
    // Return empty array to avoid crashing the UI
    return [];
  }
};
