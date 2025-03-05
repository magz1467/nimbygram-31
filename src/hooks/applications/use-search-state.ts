
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from "@/utils/fetchApplications";
import { useSearchStateManager } from './use-search-state-manager';

export const useSearchState = (initialPostcode = '') => {
  const {
    postcode,
    setPostcode,
    isSearching, 
    setIsSearching,
    searchStartTime,
    setSearchStartTime,
    searchPoint,
    setSearchPoint,
    handlePostcodeSelect,
    locationState
  } = useSearchStateManager(initialPostcode);
  
  const { toast } = useToast();

  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(postcode);

  console.log('📍 useSearchState: Current state:', { 
    postcode, 
    coordinates, 
    isLoadingCoords,
    coordsError: coordsError?.message,
    locationState 
  });

  // Handle coordinates error with toast
  useEffect(() => {
    if (coordsError) {
      console.error('Error fetching coordinates:', coordsError);
      if (isSearching) {
        toast({
          title: "Postcode Error",
          description: "Could not find coordinates for this postcode. Please try another postcode.",
          variant: "destructive",
        });
        setIsSearching(false);
      }
    }
  }, [coordsError, toast, isSearching, setIsSearching]);

  const { 
    data: applications = [], 
    isLoading: isLoadingApps,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ['applications', coordinates ? coordinates.join(',') : null],
    queryFn: () => fetchApplications(coordinates),
    enabled: !!coordinates && !coordsError, // Only run query if we have coordinates and no error
    staleTime: 0, // Always fetch fresh data
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Show toast for application fetch errors
  useEffect(() => {
    if (isError && error) {
      console.error('❌ Error fetching applications:', error);
      toast({
        title: "Search Error",
        description: "There was a problem finding planning applications. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Handle search state from URL - only on mount
  useEffect(() => {
    const searchState = locationState;
    if (searchState?.searchType === 'postcode' && searchState?.searchTerm && !postcode) {
      console.log('📍 Setting initial postcode from URL state:', searchState.searchTerm);
      setPostcode(searchState.searchTerm);
      setIsSearching(true);
      setSearchStartTime(Date.now());
    }
  }, [locationState, postcode, setPostcode, setIsSearching, setSearchStartTime]);

  // Handle coordinates change
  useEffect(() => {
    if (coordinates && isSearching && !searchPoint) {
      console.log('🌍 New coordinates received, updating search point:', coordinates);
      setSearchPoint(coordinates);
    }
  }, [coordinates, searchPoint, isSearching, setSearchPoint]);

  return {
    postcode,
    coordinates,
    isLoadingCoords,
    isLoadingApps,
    applications,
    isSearching,
    setIsSearching,
    handlePostcodeSelect,
    searchStartTime,
    setSearchStartTime,
    searchPoint,
    setSearchPoint,
    error,
    coordsError,
    refetch
  };
};
