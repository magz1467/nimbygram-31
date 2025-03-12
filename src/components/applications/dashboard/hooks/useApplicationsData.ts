
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';

interface UseApplicationsDataProps {
  postcode?: string;
  radius?: number;
}

export const useApplicationsData = ({ postcode, radius = 5 }: UseApplicationsDataProps = {}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!postcode) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch coordinates
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        
        if (!data.result) {
          throw new Error('Invalid postcode');
        }
        
        const coords: [number, number] = [data.result.latitude, data.result.longitude];
        setCoordinates(coords);
        
        // Fetch applications
        const kmPerDegree = 111.32;
        const latDiff = radius / kmPerDegree;
        const lngDiff = radius / (kmPerDegree * Math.cos(coords[0] * Math.PI / 180));
        
        // Query with geographic bounds
        const { data: applicationsData, error: dbError } = await supabase
          .from('crystal_roof')
          .select('*')
          .gte('latitude', coords[0] - latDiff)
          .lte('latitude', coords[0] + latDiff)
          .gte('longitude', coords[1] - lngDiff)
          .lte('longitude', coords[1] + lngDiff)
          .limit(500);
          
        if (dbError) throw dbError;

        // Transform raw data to Application type
        const transformedApps = (applicationsData || []).map(item => ({
          id: item.id,
          title: item.description || `Application ${item.id}`,
          address: item.address || '',
          status: item.status || 'Under Review',
          coordinates: item.latitude && item.longitude 
            ? [Number(item.latitude), Number(item.longitude)] 
            : undefined,
          reference: item.reference || '',
          description: item.description || '',
          applicant: item.applicant || '',
          submissionDate: item.submission_date || '',
          submittedDate: item.submission_date || '',
          decisionDue: item.decision_due || '',
          type: item.type || '',
          ward: item.ward || '',
          received_date: item.received_date || item.received || item.submission_date || null,
          image_map_url: item.image_map_url || null,
          postcode: item.postcode || ''
        }));
        
        setApplications(transformedApps);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err : new Error('Failed to fetch data');
        setError(errorMessage);
        handleError(errorMessage, { context: 'fetchApplicationsData' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postcode, radius]);

  // Sort applications by received_date
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
    const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
    return dateB - dateA;
  });

  return {
    applications: sortedApplications,
    isLoading,
    error,
    coordinates
  };
};
