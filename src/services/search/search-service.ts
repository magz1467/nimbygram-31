
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
  radius: number
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
const searchWithDirectQuery = async (): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('crystal_roof')
    .select('*');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Main search function
 */
export const searchApplications = async (coordinates: [number, number]): Promise<Application[]> => {
  if (!coordinates) {
    console.log('❌ No coordinates provided');
    return [];
  }

  console.log('🔍 Searching applications for coordinates:', coordinates);
  const [lat, lng] = coordinates;
  const radius = 10000; // 10km radius

  try {
    // First try edge function with timeout
    try {
      console.log('🔄 Attempting search with edge function');
      const results = await withTimeout(
        searchWithEdgeFunction(lat, lng, radius),
        30000,
        "Edge function search timed out"
      );

      if (results.length > 0) {
        console.log(`✅ Edge function returned ${results.length} results`);
        return transformAndSortResults(results, coordinates);
      }
    } catch (error) {
      console.warn('⚠️ Edge function search failed, falling back to direct query:', error);
    }

    // Fallback to direct query with timeout
    console.log('📊 Falling back to direct database query');
    const results = await withTimeout(
      searchWithDirectQuery(),
      40000,
      "Database query timed out"
    );

    console.log(`✅ Direct query returned ${results.length} results`);
    return transformAndSortResults(results, coordinates);

  } catch (error: any) {
    handleSearchError(error);
    throw error;
  }
};

/**
 * Transform and sort search results
 */
const transformAndSortResults = (results: any[], coordinates: [number, number]): Application[] => {
  return results
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null)
    .sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      return distanceA - distanceB;
    });
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
  // Simple Euclidean distance for sorting purposes
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

