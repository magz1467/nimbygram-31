
import { useState, useEffect } from 'react';
import { useMapViewStore } from '../store/mapViewStore';

// Mock API function since the real one isn't available
async function fetchApplications(postcode: string) {
  console.log(`Fetching applications for postcode: ${postcode}`);
  // Return mock data
  return [
    {
      id: 1,
      address: '123 Test Street',
      reference: 'REF123',
      description: 'Sample planning application',
      status: 'Pending',
      date: new Date().toISOString(),
      latitude: 51.5074,
      longitude: -0.1278
    }
  ];
}

export function useApplicationData(postcode: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const { applications, setApplications } = useMapViewStore();
  
  useEffect(() => {
    async function loadApplications() {
      if (postcode) {
        try {
          setIsLoading(true);
          const data = await fetchApplications(postcode);
          setApplications(data);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadApplications();
  }, [postcode, setApplications]);
  
  return { applications, isLoading };
}
