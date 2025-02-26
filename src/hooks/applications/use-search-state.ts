
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";
import { useLocation } from 'react-router-dom';

export const useSearchState = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);
  const { toast } = useToast();

  // Handle search state from URL
  useEffect(() => {
    if (location.state?.searchType === 'postcode' && location.state?.searchTerm) {
      const newPostcode = location.state.searchTerm;
      console.log('📍 Setting postcode from URL state:', newPostcode);
      setPostcode(newPostcode);
      setSearchStartTime(location.state.timestamp);
      setIsSearching(true);
    }
  }, [location.state]);

  const handlePostcodeSelect = async (newPostcode: string) => {
    if (!newPostcode) {
      toast({
        title: "Invalid Postcode",
        description: "Please enter a valid postcode to search.",
        variant: "destructive",
      });
      return;
    }
    setIsSearching(true);
    setSearchStartTime(Date.now());
    setPostcode(newPostcode);
  };

  return {
    postcode,
    coordinates,
    isLoadingCoords,
    searchPoint,
    setSearchPoint,
    searchStartTime,
    setSearchStartTime,
    isSearching,
    setIsSearching,
    handlePostcodeSelect
  };
};
