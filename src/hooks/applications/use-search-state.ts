
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

  return data || [];
};

export const useSearchState = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Use useCoordinates hook with useMemo to prevent unnecessary re-renders
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);

  // Use React Query for applications data
  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', coordinates],
    queryFn: () => fetchApplications(coordinates),
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
  });

  // Handle search state from URL - only on mount or navigation
  useEffect(() => {
    if (location.state?.searchType === 'postcode' && location.state?.searchTerm) {
      const newPostcode = location.state.searchTerm;
      console.log('📍 Setting postcode from URL state:', newPostcode);
      setPostcode(newPostcode);
      setIsSearching(true);
      setSearchStartTime(Date.now());
    }
  }, [location.state?.searchTerm, location.state?.searchType]);

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
    console.log('🔍 Starting new postcode search:', newPostcode);
    setIsSearching(true);
    setPostcode(newPostcode);
    setSearchStartTime(Date.now());
  }, [toast]);

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
    setSearchStartTime
  };
};
