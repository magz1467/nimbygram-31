
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { useErrorHandler } from '@/hooks/use-error-handler';
import { supabase } from "@/integrations/supabase/client";

export interface ApplicationsDataParams {
  coordinates?: [number, number];
  radius?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export function useApplicationsData(params: ApplicationsDataParams) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  
  useEffect(() => {
    if (!params.coordinates) {
      return;
    }
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const [lat, lng] = params.coordinates || [0, 0];
        const radius = params.radius || 5;
        const limit = params.limit || 100;
        
        // Attempt to use spatial search function if available
        try {
          const { data, error } = await supabase.rpc('get_nearby_applications', { 
            center_lat: lat,
            center_lng: lng,
            radius_km: radius,
            result_limit: limit
          });
          
          if (error) {
            // If specific RPC function error, use fallback
            if (error.message.includes('function') || error.message.includes('does not exist')) {
              console.log('Spatial search not available, using fallback');
              throw new Error('Spatial search not available');
            }
            throw error;
          }
          
          setApplications(data || []);
        } catch (spatialError) {
          // Fallback to manual bounding box search
          console.log('Using fallback search method');
          
          // Calculate bounding box (simple approximation)
          const latDelta = radius / 111; // ~111km per degree of latitude
          const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180)); // Adjust for longitude
          
          const { data, error } = await supabase
            .from('crystal_roof')
            .select('*')
            .gte('latitude', lat - latDelta)
            .lte('latitude', lat + latDelta)
            .gte('longitude', lng - lngDelta)
            .lte('longitude', lng + lngDelta)
            .limit(limit);
            
          if (error) throw error;
          
          setApplications(data || []);
        }
      } catch (err) {
        const appError = handleError(err, { title: 'Error fetching applications' });
        setError(appError as Error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [params.coordinates, params.radius, params.limit, params.filters, handleError]);
  
  return { applications, isLoading, error };
}
