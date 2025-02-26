
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useLocation } from 'react-router-dom';
import { useMapApplications } from "@/hooks/use-map-applications";

export const useSearchState = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Memoize coordinates to prevent unnecessary re-renders
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);
  
  // Only fetch applications when we have valid coordinates
  const { applications, isLoading: isLoadingApps } = useMapApplications(
    searchPoint || coordinates
  );

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

  // Update search point when coordinates change
  useEffect(() => {
    if (coordinates && isSearching) {
      console.log('🎯 Updating search point with coordinates:', coordinates);
      setSearchPoint(coordinates);
    }
  }, [coordinates, isSearching]);

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
    searchPoint,
    setSearchPoint,
    isSearching,
    setIsSearching,
    handlePostcodeSelect,
    searchStartTime,
    setSearchStartTime
  };
};
