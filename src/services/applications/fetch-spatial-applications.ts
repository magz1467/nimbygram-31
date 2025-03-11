
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/transforms/application-transformer";
import { toast } from "@/hooks/use-toast";

interface FetchSpatialApplicationsOptions {
  coordinates: [number, number]; // [latitude, longitude]
  radiusKm?: number;
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  classification?: string;
}

export const fetchSpatialApplications = async ({
  coordinates,
  radiusKm = 10,
  page = 0,
  pageSize = 25,
  status,
  type,
  classification
}: FetchSpatialApplicationsOptions): Promise<{
  applications: Application[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> => {
  if (!coordinates) {
    console.error('No coordinates provided to fetchSpatialApplications');
    return { applications: [], totalCount: 0, currentPage: page, totalPages: 0 };
  }

  const [lat, lng] = coordinates;
  console.log(`🔍 Fetching applications within ${radiusKm}km of [${lat}, ${lng}]`);
  
  try {
    // Calculate pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Build the query with simpler filtering approach
    let query = supabase
      .from('crystal_roof')
      .select('*', { count: 'exact' });
    
    // Add filters if provided
    if (status) {
      query = query.ilike('status', `%${status}%`);
    }
    
    if (type) {
      query = query.ilike('application_type', `%${type}%`);
    }
    
    if (classification) {
      query = query.ilike('class_3', `%${classification}%`);
    }
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, count, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform the raw data into Application objects with coordinates
    const applications = (data || [])
      .map(app => transformApplicationData(app, coordinates))
      .filter((app): app is Application => app !== null);
    
    // Sort applications by distance (since we're not doing it in the query)
    const sortedApplications = applications.sort((a, b) => {
      if (!a.distance || !b.distance) return 0;
      return a.distance - b.distance;
    });
    
    // Calculate total pages
    const totalCount = count || sortedApplications.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    console.log(`✅ Retrieved ${sortedApplications.length} applications from database (page ${page + 1}/${totalPages})`);
    
    return {
      applications: sortedApplications,
      totalCount,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching applications with spatial query:', error);
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "We're having trouble loading all results. Please try again.",
      variant: "destructive",
    });
    return { applications: [], totalCount: 0, currentPage: page, totalPages: 0 };
  }
};
