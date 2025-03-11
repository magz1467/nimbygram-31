import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { supabase } from "@/integrations/supabase/client";

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
        console.log(`🔍 Searching with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
        
        const [lat, lng] = coordinates;
        const radiusKm = 10;
        const radiusMeters = radiusKm * 1000;
        
        let query = supabase
          .from('crystal_roof')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);
        
        const latDegPerKm = 1 / 111;
        const lngDegPerKm = 1 / (111 * Math.cos(lat * Math.PI / 180));
        
        const latMin = lat - (radiusKm * latDegPerKm);
        const latMax = lat + (radiusKm * latDegPerKm);
        const lngMin = lng - (radiusKm * lngDegPerKm);
        const lngMax = lng + (radiusKm * lngDegPerKm);
        
        query = query
          .gte('latitude', latMin)
          .lte('latitude', latMax)
          .gte('longitude', lngMin)
          .lte('longitude', lngMax);
        
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
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No results found for the search criteria');
          return [];
        }
        
        const results = data.map(app => {
          const distance = calculateDistance(
            lat,
            lng,
            Number(app.latitude),
            Number(app.longitude)
          );
          return { ...app, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        console.log(`✅ Found ${results.length} planning applications`);
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
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    filters,
    setFilters
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
