
import { useState, useCallback } from 'react';
import { Application } from '@/types/planning';
import { useApplicationsData } from '@/components/applications/dashboard/hooks/useApplicationsData';
import { calculateStatusCounts, StatusCounts } from '@/hooks/applications/use-status-counts';
import { fetchApplicationsInRadius } from '@/hooks/applications/use-applications-fetch';

export interface DashboardState {
  postcode: string;
  radius: number;
  applications: Application[];
  selectedApplicationId: number | null;
  isLoading: boolean;
  error: Error | null;
  coordinates: [number, number] | null;
  statusCounts: StatusCounts;
}

export const useDashboardState = () => {
  const [postcode, setPostcode] = useState<string>('');
  const [radius, setRadius] = useState<number>(5);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  
  // Fetch applications data using the hook
  const { 
    applications, 
    isLoading, 
    error, 
    coordinates 
  } = useApplicationsData({ postcode, radius });
  
  // Calculate status counts
  const statusCounts = calculateStatusCounts(applications);
  
  // Handler for searching for a new postcode
  const handleSearch = useCallback((newPostcode: string, newRadius?: number) => {
    setPostcode(newPostcode);
    if (newRadius) setRadius(newRadius);
    setSelectedApplicationId(null);
  }, []);
  
  // Handler for selecting an application
  const handleSelectApplication = useCallback((id: number) => {
    setSelectedApplicationId(id);
  }, []);
  
  // Update the search point (for nearby searches)
  const updateSearchPoint = useCallback(async (newCoords: [number, number], newRadius?: number) => {
    if (newRadius) setRadius(newRadius);
    const newApplications = await fetchApplicationsInRadius(newCoords, newRadius || radius);
    return newApplications;
  }, [radius]);
  
  return {
    state: {
      postcode,
      radius,
      applications,
      selectedApplicationId,
      isLoading,
      error,
      coordinates,
      statusCounts
    },
    actions: {
      setPostcode,
      setRadius,
      setSelectedApplicationId,
      handleSearch,
      handleSelectApplication,
      fetchApplicationsInRadius: updateSearchPoint
    }
  };
};
