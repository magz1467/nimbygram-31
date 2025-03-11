
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";

// Simple filter type definition
export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        // Get coordinates with 10km radius (fixed radius as requested)
        const [lat, lng] = coordinates;
        const radiusKm = 10; // Fixed 10km radius
        const kmPerDegree = 111.32;
        const latDiff = radiusKm / kmPerDegree;
        const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
        
        console.log(`Searching within ${radiusKm}km radius of [${lat}, ${lng}]`);
        
        // Query with geographic bounds
        let query = supabase
          .from('crystal_roof')
          .select('*, received') // Explicitly include the received column
          .gte('latitude', lat - latDiff)
          .lte('latitude', lat + latDiff)
          .gte('longitude', lng - lngDiff)
          .lte('longitude', lng + lngDiff);
          
        // Apply any filters if present
        if (filters.status) {
          query = query.ilike('status', `%${filters.status}%`);
        }
        if (filters.type) {
          query = query.or(`type.ilike.%${filters.type}%,application_type_full.ilike.%${filters.type}%`);
        }
        if (filters.classification) {
          query = query.ilike('class_3', `%${filters.classification}%`);
        }
        
        const { data, error } = await query.limit(500);
        
        if (error) {
          console.error('Supabase query error:', error);
          
          // Skip showing UI errors for known non-critical database errors
          if (error.message && (
              error.message.includes('application_support') ||
              error.message.includes('relation') ||
              (error.message.includes('does not exist') && error.message.includes('table'))
          )) {
            console.log('Non-critical database error, continuing with empty results');
            return [];
          }
          
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No results found for the search criteria');
          return [];
        }
        
        // Calculate distances and sort by closest first
        const results = data.map(app => {
          const distance = calculateDistance(
            coordinates[0],
            coordinates[1],
            Number(app.latitude),
            Number(app.longitude)
          );
          return { ...app, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        console.log(`Found ${results.length} planning applications`);
        return results;
        
      } catch (err: any) {
        console.error('Search error:', err);
        toast({
          title: "Search Error",
          description: "There was a problem finding planning applications. Please try again.",
          variant: "destructive",
        });
        
        // Return empty array instead of throwing to prevent UI from breaking
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to prevent excessive error toasts
  });

  return {
    applications,
    isLoading,
    error,
    filters,
    setFilters
  };
};

// Simple distance calculation function
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
