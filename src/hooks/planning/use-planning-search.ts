
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
        
        // Try to use the optimized PostGIS function first
        try {
          console.log('Using PostGIS spatial function for efficient search');
          const { data: spatialData, error: spatialError } = await supabase
            .rpc('get_nearby_applications', { 
              center_lat: lat,
              center_lng: lng,
              radius_km: radiusKm,
              result_limit: 500
            })
            .timeout(30);
            
          if (spatialError) {
            // If the function doesn't exist or there's an error, log it and fall back to manual search
            console.warn('PostGIS function failed, falling back to manual search:', spatialError);
          } else if (spatialData && spatialData.length > 0) {
            console.log(`✅ Found ${spatialData.length} planning applications using spatial query`);
            
            // Apply filters after getting the data
            let filteredData = spatialData;
            
            if (filters.status) {
              filteredData = filteredData.filter(app => 
                app.status && app.status.toLowerCase().includes(filters.status!.toLowerCase())
              );
            }
            
            if (filters.type) {
              filteredData = filteredData.filter(app => 
                (app.type && app.type.toLowerCase().includes(filters.type!.toLowerCase())) ||
                (app.application_type_full && app.application_type_full.toLowerCase().includes(filters.type!.toLowerCase()))
              );
            }
            
            if (filters.classification) {
              filteredData = filteredData.filter(app => 
                app.class_3 && app.class_3.toLowerCase().includes(filters.classification!.toLowerCase())
              );
            }
            
            // Calculate distance and add it to the results
            const results = filteredData.map(app => {
              const distance = calculateDistance(
                lat,
                lng,
                Number(app.latitude),
                Number(app.longitude)
              );
              return { ...app, distance };
            });
            
            return results;
          }
        } catch (spatialFunctionError) {
          console.warn('Error using spatial function:', spatialFunctionError);
          // Continue to fallback method
        }
        
        // Fallback to manual bounding box search with shorter timeout
        console.log('Falling back to manual bounding box search');
        let query = supabase
          .from('crystal_roof')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .timeout(15); // Shorter timeout for fallback
        
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
        
        const { data, error } = await query.limit(200); // Reduce limit to 200 for faster queries
        
        if (error) {
          console.error('Supabase query error:', error);
          
          // If it's a timeout error, return a more specific error message
          if (error.code === '57014') {
            throw new Error('The search took too long to complete. Please try a more specific location or different filters.');
          }
          
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
        
        console.log(`✅ Found ${results.length} planning applications with fallback query`);
        return results;
      } catch (err: any) {
        console.error('Search error:', err);
        
        // Provide specific error messages for common issues
        const errorMessage = err.message || String(err);
        const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('57014');
        const userMessage = isTimeoutError 
          ? "The search took too long to complete. Please try a more specific location or different filters."
          : "There was a problem finding planning applications. Please try again.";
        
        toast({
          title: "Search Error",
          description: userMessage,
          variant: "destructive",
        });
        
        throw err; // Re-throw to let the error handling in the component deal with it
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
