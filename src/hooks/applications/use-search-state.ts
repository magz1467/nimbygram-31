
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

const fetchApplications = async (coordinates: [number, number] | null) => {
  if (!coordinates) return [];
  
  console.log('🔍 Fetching applications for coordinates:', coordinates);
  
  const { data, error } = await supabase
    .from('crystal_roof')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return data.map(app => ({
    ...app,
    title: app.description || app.title || `Application ${app.id}`,
  })) || [];
};

export const useSearchState = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Use useCoordinates hook with useMemo to prevent unnecessary re-renders
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);

  // Use React Query for applications data with modified caching strategy
  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', coordinates ? coordinates.join(',') : null],
    queryFn: () => fetchApplications(coordinates),
    enabled: !!coordinates,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Handle search state from URL - only on mount or navigation
  useEffect(() => {
    const searchState = location.state;
    if (searchState?.searchType === 'postcode' && searchState?.searchTerm && !postcode) {
      const newPostcode = searchState.searchTerm;
      console.log('📍 Setting postcode from URL state:', newPostcode);
      setPostcode(newPostcode);
      setIsSearching(true);
      setSearchStartTime(Date.now());
    }
  }, [location.state?.searchTerm, location.state?.searchType, postcode]);

  // Memoize handlePostcodeSelect to prevent unnecessary re-renders
  const handlePostcodeSelect = useCallback(async (newPostcode: string) => {
    if (!newPostcode) {
      toast({
        title: "Invalid Postcode",
        description: "Please enter a valid postcode to search.",
        variant: "destructive",
      });
      return;
    }
    
    // Only update if postcode has changed
    if (newPostcode !== postcode) {
      console.log('🔍 Starting new postcode search:', newPostcode);
      setIsSearching(true);
      setPostcode(newPostcode);
      setSearchStartTime(Date.now());
    }
  }, [postcode, toast]);

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
    setSearchPoint
  };
};
