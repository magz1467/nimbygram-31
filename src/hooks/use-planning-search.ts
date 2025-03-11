
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";

interface SearchFilters {
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
        // Calculate bounds for the search area (20km radius)
        const [lat, lng] = coordinates;
        const kmPerDegree = 111.32; // Approximate km per degree of latitude
        const latDiff = 20 / kmPerDegree;
        const lngDiff = 20 / (kmPerDegree * Math.cos(lat * Math.PI / 180));
        
        // Query the crystal_roof table directly with bounds
        let query = supabase
          .from('crystal_roof')
          .select('*')
          .gte('latitude', lat - latDiff)
          .lte('latitude', lat + latDiff)
          .gte('longitude', lng - lngDiff)
          .lte('longitude', lng + lngDiff);
          
        // Apply any active filters
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
        
        if (error) throw error;
        
        // Calculate distances and sort
        const results = (data || []).map(app => {
          const distance = calculateDistance(
            coordinates[0],
            coordinates[1],
            Number(app.latitude),
            Number(app.longitude)
          );
          return { ...app, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        return results;
        
      } catch (err: any) {
        console.error('Search error:', err);
        toast({
          title: "Search Error",
          description: "There was a problem finding planning applications. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    applications,
    isLoading,
    error,
    filters,
    setFilters
  };
};

// Helper function to calculate distance between coordinates
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
