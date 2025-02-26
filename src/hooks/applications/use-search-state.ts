
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCoordinates } from "@/hooks/use-coordinates";

export const useSearchState = (initialPostcode = '') => {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(postcode);
  const { toast } = useToast();

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

