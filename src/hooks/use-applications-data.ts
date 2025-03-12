
import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { fetchApplicationById } from "@/services/applications/application-service";
import { fetchApplicationsByLocation } from "@/services/applications/application-service";

export const useApplicationsData = (
  coordinates: [number, number] | null,
  radius: number = 5,
  limit: number = 100
) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coordinates) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [lat, lng] = coordinates;
        const results = await fetchApplicationsByLocation(lat, lng, radius);
        setApplications(results.slice(0, limit));
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coordinates, radius, limit]);

  return { applications, loading, error };
};
