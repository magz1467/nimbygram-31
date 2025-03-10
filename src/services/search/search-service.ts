
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/applicationTransforms";
import { toast } from "@/hooks/use-toast";

/**
 * Search timeout error class
 */
class SearchTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchTimeoutError';
  }
}

/**
 * Executes a function with timeout
 */
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new SearchTimeoutError(timeoutMessage)), timeoutMs)
    )
  ]);
};

/**
 * Makes a search request to the edge function
 */
const searchWithEdgeFunction = async (
  lat: number, 
  lng: number, 
  radius: number,
  searchTerm?: string
): Promise<Application[]> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/get-applications-with-counts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      center_lat: lat,
      center_lng: lng,
      radius_meters: radius,
      search_term: searchTerm,
      page_size: 100
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function failed: ${errorText || response.statusText}`);
  }

  const result = await response.json();
  return result.applications || [];
}

/**
 * Makes a direct database query
 */
const searchWithDirectQuery = async (searchTerm?: string): Promise<Application[]> => {
  console.log('📊 Direct query search with term:', searchTerm);
  let query = supabase
    .from('crystal_roof')
    .select('*');
  
  // If we have a search term, use it to filter results with OR conditions
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    // Improve location matching by specifically searching these fields
    query = query.or(
      `address.ilike.%${searchTermLower}%,` +
      `description.ilike.%${searchTermLower}%,` + 
      `ward_name.ilike.%${searchTermLower}%,` + 
      `local_authority_district_name.ilike.%${searchTermLower}%`
    );
  }
  
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  console.log(`📊 Direct query returned ${data?.length || 0} results`);
  return data || [];
}

/**
 * Main search function
 */
export const searchApplications = async (
  coordinates: [number, number] | null,
  searchTerm?: string
): Promise<Application[]> => {
  if (!coordinates && !searchTerm) {
    console.log('❌ No search parameters provided');
    return [];
  }

  console.log('🔍 Searching applications:', { coordinates, searchTerm });
  
  try {
    if (coordinates) {
      const [lat, lng] = coordinates;
      const radius = 10000; // 10km radius

      // First try edge function with timeout
      try {
        console.log('🔄 Attempting search with edge function');
        const results = await withTimeout(
          searchWithEdgeFunction(lat, lng, radius, searchTerm),
          30000,
          "Edge function search timed out"
        );

        if (results.length > 0) {
          console.log(`✅ Edge function returned ${results.length} results`);
          return transformAndSortResults(results, coordinates, searchTerm);
        }
      } catch (error) {
        console.warn('⚠️ Edge function search failed, falling back to direct query:', error);
      }
    }

    // Fallback to direct query with timeout
    console.log('📊 Falling back to direct database query');
    const results = await withTimeout(
      searchWithDirectQuery(searchTerm),
      40000,
      "Database query timed out"
    );

    console.log(`✅ Direct query returned ${results.length} results`);
    return transformAndSortResults(results, coordinates, searchTerm);

  } catch (error: any) {
    handleSearchError(error);
    throw error;
  }
};

/**
 * Transform and sort search results
 */
const transformAndSortResults = (
  results: any[], 
  coordinates: [number, number] | null,
  searchTerm?: string
): Application[] => {
  console.log('🔄 Transforming and sorting results:', { 
    resultCount: results.length, 
    hasCoordinates: !!coordinates, 
    searchTerm 
  });
  
  // First filter results if we have a search term and no coordinates
  let filteredResults = results;
  
  if (searchTerm && !coordinates) {
    const searchTermLower = searchTerm.toLowerCase();
    console.log('🔍 Filtering by search term without coordinates:', searchTermLower);
    
    // Add more precise filtering for location searches
    filteredResults = results.filter(app => {
      // Check specific location fields
      const addressMatch = app.address && app.address.toLowerCase().includes(searchTermLower);
      const wardMatch = app.ward_name && app.ward_name.toLowerCase().includes(searchTermLower);
      const districtMatch = app.local_authority_district_name && 
                            app.local_authority_district_name.toLowerCase().includes(searchTermLower);
      const descriptionMatch = app.description && app.description.toLowerCase().includes(searchTermLower);
      
      return addressMatch || wardMatch || districtMatch || descriptionMatch;
    });
    
    console.log(`🔍 Filtered from ${results.length} to ${filteredResults.length} results by text`);
  }

  // Transform application data
  const transformedResults = filteredResults
    .map(app => {
      // Fix for the error: Pass default coordinates when none are available
      if (coordinates) {
        return transformApplicationData(app, coordinates);
      } else {
        // Use a default center point for London when no coordinates are provided
        const defaultCenter: [number, number] = [51.5074, -0.1278]; // London center
        return transformApplicationData(app, defaultCenter);
      }
    })
    .filter((app): app is Application => app !== null);

  // Sort results
  if (coordinates) {
    // Sort by distance if we have coordinates
    console.log('🔄 Sorting by distance from coordinates');
    return transformedResults.sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      
      return distanceA - distanceB;
    });
  } else if (searchTerm) {
    // If we only have a search term, sort by relevance with improved location matching
    const searchTermLower = searchTerm.toLowerCase();
    console.log('🔄 Sorting by relevance to:', searchTermLower);
    
    return transformedResults.sort((a, b) => {
      const relevanceA = calculateRelevance(a, searchTermLower);
      const relevanceB = calculateRelevance(b, searchTermLower);
      
      // Higher relevance comes first
      return relevanceB - relevanceA;
    });
  }
  
  // Default: sort by most recent
  console.log('🔄 Using default sort by submission date');
  return transformedResults.sort((a, b) => {
    const dateA = a.submittedDate || a.submissionDate || a.received_date || '';
    const dateB = b.submittedDate || b.submissionDate || b.received_date || '';
    
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
};

/**
 * Calculate relevance score for text search with improved location matching
 */
const calculateRelevance = (application: Application, searchTerm: string): number => {
  let score = 0;
  
  // Exact location matches should get HIGHEST priority
  // This is the main fix for the Wendover issue
  if (application.ward && application.ward.toLowerCase() === searchTerm) {
    // Exact ward name match (e.g. Wendover)
    score += 300;
  } else if (application.ward && application.ward.toLowerCase().includes(searchTerm)) {
    // Ward name contains the search term
    score += 200;
  }
  
  // Check for district matches
  const district = application.local_authority_district_name || '';
  if (district.toLowerCase() === searchTerm) {
    // Exact district match
    score += 250;
  } else if (district.toLowerCase().includes(searchTerm)) {
    // District contains search term
    score += 150;
  }
  
  // Check for exact matches in address (high priority)
  if (application.address && application.address.toLowerCase().includes(searchTerm)) {
    score += 100;
    // Exact match at start of address gets higher score
    if (application.address.toLowerCase().startsWith(searchTerm)) {
      score += 50;
    }
  }
  
  // Check for matches in description (lower priority)
  if (application.description && application.description.toLowerCase().includes(searchTerm)) {
    score += 30;
  }
  
  console.log(`🔢 Relevance score for app ${application.id}: ${score} (${application.ward || 'no ward'}, ${district || 'no district'})`);
  return score;
};

/**
 * Handle search errors
 */
const handleSearchError = (error: any) => {
  const errorMessage = error?.message || String(error);
  console.error('❌ Search error:', errorMessage);

  if (error instanceof SearchTimeoutError || 
      errorMessage.includes('57014') || 
      errorMessage.includes('statement canceled')) {
    toast({
      title: "Search Timeout",
      description: "The search took too long. Please try a more specific location.",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Search Error",
    description: "We're having trouble searching. Please try again.",
    variant: "destructive",
  });
};

/**
 * Calculate distance between coordinates
 */
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  // Using the Haversine formula to calculate distance
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
};
