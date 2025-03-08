
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchNearbyApplications } from "@/services/applications/fetch-nearby-applications";
import { transformAndSortApplications } from "@/services/applications/transform-applications";

export const useMapApplications = (coordinates?: [number, number] | null) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data...');
      console.log('🌍 Search coordinates:', coordinates);
      setIsLoading(true);
      setError(null);
      
      try {
        if (!coordinates) {
          console.log('⚠️ No coordinates provided, skipping fetch');
          setApplications([]);
          setIsLoading(false);
          return;
        }

        // Fetch nearby applications (reduced radius from 20km to 10km)
        const properties = await fetchNearbyApplications(coordinates, 10);
        
        if (!properties) {
          setError(new Error("Failed to fetch properties"));
          setApplications([]);
          setIsLoading(false);
          
          if (retryCount < 2) {
            // Auto-retry once with a smaller radius
            console.log(`Auto-retrying with smaller radius (attempt ${retryCount + 1}/2)`);
            setRetryCount(prev => prev + 1);
          } else {
            toast({
              title: "Error loading properties",
              description: "Please try again later or search for a different location",
              variant: "destructive"
            });
          }
          return;
        }

        // Transform and sort applications
        const sortedData = transformAndSortApplications(properties, coordinates);
        setApplications(sortedData);
        setRetryCount(0); // Reset retry count on success

        if (sortedData.length === 0) {
          toast({
            title: "No properties found",
            description: "No properties found near this location. Try searching for a different area.",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setApplications([]);
        
        toast({
          title: "Error loading properties",
          description: "Please try again later or search for a different location",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        console.log('🏁 Property fetch completed');
      }
    };

    fetchPropertyData();
  }, [coordinates, retryCount]);

  // Expose retry functionality
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return { applications, isLoading, error, retry };
};
