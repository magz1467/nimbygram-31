
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
    // Get all applications without filtering first
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*');

    if (error) throw error;
    
    console.log(`✅ Raw data from supabase: ${data?.length || 0} results`);

    if (!data || data.length === 0) {
      console.log('No applications found in the database');
      return [];
    }

    // Transform all application data
    const transformedApplications = data.map(app => 
      transformApplicationData(app, coordinates)
    ).filter((app): app is Application => app !== null);
    
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
    
    // Show toast to the user
    toast({
      title: "Search Error",
      description: "We're having trouble loading the results. Please try again or search for a different location.",
      variant: "destructive",
    });
    
    // Return empty array instead of throwing
    console.log('Returning empty array due to error');
    return [];
  }
};
