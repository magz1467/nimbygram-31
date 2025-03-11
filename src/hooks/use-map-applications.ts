
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { fetchNearbyApplications, transformAndSortApplications } from "./planning/map/fetch-nearby-applications";
import { handleMapError } from "./planning/map/map-error-handler";

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
        handleMapError(err, toast);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [coordinates, toast]);

  return { applications, isLoading, error };
};
