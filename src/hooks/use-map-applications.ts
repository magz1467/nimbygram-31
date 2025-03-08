
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchNearbyApplications } from "@/services/applications/fetch-nearby-applications";
import { transformAndSortApplications } from "@/services/applications/transform-applications";

export const useMapApplications = (coordinates?: [number, number] | null) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data...');
      console.log('🌍 Search coordinates:', coordinates);
      setIsLoading(true);
      
      try {
        if (!coordinates) {
          console.log('⚠️ No coordinates provided, skipping fetch');
          setApplications([]);
          setIsLoading(false);
          return;
        }

        // Fetch nearby applications (20km radius)
        const properties = await fetchNearbyApplications(coordinates, 20);
        
        if (!properties) {
          toast({
            title: "Error loading properties",
            description: "Please try again later",
            variant: "destructive"
          });
          setApplications([]);
          setIsLoading(false);
          return;
        }

        // Transform and sort applications
        const sortedData = transformAndSortApplications(properties, coordinates);
        setApplications(sortedData);

        if (sortedData.length === 0) {
          toast({
            title: "No properties found",
            description: "No properties found within 20km of your location",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        toast({
          title: "Error loading properties",
          description: "Please try again later",
          variant: "destructive"
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
        console.log('🏁 Property fetch completed');
      }
    };

    fetchPropertyData();
  }, [coordinates]);

  return { applications, isLoading };
};
