
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/distance";
import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { toast } from "@/hooks/use-toast";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ fetchApplications: No coordinates provided');
    return [];
  }
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  try {
    // First, try to fetch from the edge function which has better timeout handling
    try {
      console.log('🔄 Attempting to fetch applications using edge function');
      
      const [lat, lng] = coordinates;
      const radius = 10000; // 10km radius
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-applications-with-counts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          center_lat: lat,
          center_lng: lng,
          radius_meters: radius,
          page_size: 100
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge function error:', errorText);
        throw new Error('Edge function failed: ' + (errorText || response.statusText));
      }
      
      const result = await response.json();
      
      if (result.applications && Array.isArray(result.applications)) {
        console.log(`✅ Successfully retrieved ${result.applications.length} applications from edge function`);
        
        // Transform the applications
        const transformedApplications = result.applications
          .map(app => transformApplicationData(app, coordinates))
          .filter((app): app is Application => app !== null);
        
        // Sort by distance
        return transformedApplications.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          const distanceA = calculateDistance(coordinates, a.coordinates);
          const distanceB = calculateDistance(coordinates, b.coordinates);
          return distanceA - distanceB;
        });
      }
      
      console.log('Edge function returned no applications, falling back to direct query');
    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge function failed, falling back to direct query:', edgeFunctionError);
      // Continue to fallback method
    }
    
    // Fallback to direct query
    console.log('📊 Fetching applications directly from database');
    
    // Get all applications without filtering first
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      // This function doesn't support timeout, we'll handle it with Promise.race below

    if (error) {
      // Handle database errors
      console.error('❌ Database error in fetchApplications:', error);
      throw error;
    }
    
    console.log(`✅ Raw data from supabase: ${data?.length || 0} results`);

    if (!data || data.length === 0) {
      console.log('No applications found in the database');
      return [];
    }

    // Transform all application data
    const transformedApplications = data
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    console.log(`✅ Total transformed applications: ${transformedApplications.length}`);
    
    // Sort by distance
    return transformedApplications.sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      return distanceA - distanceB;
    });
  } catch (err) {
    console.error('❌ Error in fetchApplications:', err);
    
    // Add specific error handling for timeout errors
    const errorStr = String(err);
    if (errorStr.includes('timeout') || errorStr.includes('57014') || errorStr.includes('statement canceled')) {
      const timeoutError = new Error("Search timed out. The area may have too many results or the database is busy. Try searching for a more specific location.");
      
      // Show toast to the user
      toast({
        title: "Search Timeout",
        description: "The search took too long to complete. Please try a more specific location.",
        variant: "destructive",
      });
      
      throw timeoutError;
    }
    
    // Show generic error toast
    toast({
      title: "Search Error",
      description: err instanceof Error ? err.message : "We're having trouble loading the results. Please try again or search for a different location.",
      variant: "destructive",
    });
    
    throw err; // Throw the error to allow proper handling by the caller
  }
};
