
import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

export const useSearchStateManager = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Handle postcode selection
  const handlePostcodeSelect = useCallback((newPostcode: string) => {
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
    // Reset any previous search points to ensure fresh search
    setSearchPoint(null);
  }, [toast]);

  return {
    postcode,
    setPostcode,
    isSearching, 
    setIsSearching,
    searchStartTime,
    setSearchStartTime,
    searchPoint,
    setSearchPoint,
    handlePostcodeSelect,
    locationState: location.state
  };
};
