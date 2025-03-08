import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchAddressSuggestions } from "@/services/address/postcode-autocomplete";
import { fetchPlaceDetails } from "@/services/address/utils/places-details-fetcher";

interface UsePostcodeInputProps {
  onSelect: (postcode: string) => void;
}

export const usePostcodeInput = ({ onSelect }: UsePostcodeInputProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commandRef.current && 
        !commandRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: suggestions, isLoading, isFetching, error } = useQuery({
    queryKey: ["postcode-suggestions", debouncedSearch],
    queryFn: () => fetchAddressSuggestions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleSelect = useCallback(async (value: string) => {
    setSearch(value);
    setOpen(false);
    
    // Check if this is a Google Place ID (starts with "ChIJ" typically)
    if (value.startsWith("ChIJ") || value.includes("place_id:")) {
      console.log('🔍 Detected place ID, fetching detailed place information:', value);
      
      try {
        // Extract the place ID if it's in the format "place_id:ChIJ..."
        const placeId = value.includes("place_id:") 
          ? value.split("place_id:")[1].trim() 
          : value;
        
        // Fetch detailed place information
        const placeDetails = await fetchPlaceDetails(placeId);
        
        if (placeDetails && placeDetails.formatted_address) {
          console.log('✅ Retrieved place details:', placeDetails);
          
          // Use a more human-readable address for display but keep coordinates
          const readablePostcode = placeDetails.formatted_address;
          
          // Call onSelect with the readable address
          console.log('📍 Selecting readable address:', readablePostcode);
          onSelect(readablePostcode);
          return;
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
    
    // If not a place ID or couldn't get details, just use the value directly
    console.log('📍 Selecting address:', value);
    onSelect(value);
  }, [onSelect]);

  const handleInputChange = useCallback((value: string) => {
    setSearch(value);
    if (value.length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    if (search.trim().length > 0) {
      handleSelect(search);
    }
  }, [search, handleSelect]);

  return {
    search,
    open,
    inputRef,
    commandRef,
    suggestions,
    isLoading,
    isFetching,
    error,
    handleSelect,
    handleSearchClick,
    handleInputChange,
  };
};
