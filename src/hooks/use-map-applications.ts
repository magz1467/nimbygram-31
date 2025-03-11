
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/utils/distance";
import { supabase } from "@/integrations/supabase/client";

// Simple function to fetch applications from the database
async function fetchNearbyApplications(
  coordinates: [number, number], 
  radiusKm: number = 10
): Promise<any[]> {
  const [lat, lng] = coordinates;
  
  // Calculate bounding box for the search area
  const kmPerDegree = 111.32;
  const latDiff = radiusKm / kmPerDegree;
  const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
  
  // Query with geographic bounds
  const { data, error } = await supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', lat - latDiff)
    .lte('latitude', lat + latDiff)
    .gte('longitude', lng - lngDiff)
    .lte('longitude', lng + lngDiff)
    .limit(500);
    
  if (error) throw error;
  return data || [];
}

// Simple function to transform raw data into Application objects
function transformAndSortApplications(
  rawData: any[],
  coordinates: [number, number]
): Application[] {
  return rawData
    .filter(item => item.latitude && item.longitude)
    .map(item => {
      const dist = calculateDistance(
        coordinates,
        [Number(item.latitude), Number(item.longitude)]
      );
      
      return {
        id: item.id,
        title: item.description || `Application ${item.id}`,
        address: item.address || '',
        status: item.status || 'unknown',
        coordinates: [Number(item.latitude), Number(item.longitude)],
        distance: `${(dist * 0.621371).toFixed(1)} mi`, // Convert km to miles
        // Include other fields as needed
      } as Application;
    })
    .sort((a, b) => {
      const distA = calculateDistance(coordinates, a.coordinates as [number, number]);
      const distB = calculateDistance(coordinates, b.coordinates as [number, number]);
      return distA - distB;
    });
}

export const useMapApplications = (coordinates?: [number, number] | null) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!coordinates) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching applications near', coordinates);
        const data = await fetchNearbyApplications(coordinates, 10);
        const transformed = transformAndSortApplications(data, coordinates);
        setApplications(transformed);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading applications",
          description: "There was a problem loading planning applications. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [coordinates, toast]);

  return { applications, isLoading, error };
};
