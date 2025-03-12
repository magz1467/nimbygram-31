import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchAddressSuggestions } from "@/services/address/postcode-autocomplete";
import { placeIdToReadableAddress } from "@/services/address/utils/places-details-fetcher";
import { PostcodeSuggestion } from "@/types/address-suggestions";
import { 
  detectLocationType, 
  fetchCoordinatesByLocationName, 
  fetchCoordinatesFromPlaceId,
  fetchCoordinatesFromPostcodesIo
} from "@/services/coordinates";
import {
  cacheCoordinates,
  getCachedCoordinates,
  hasCoordinatesInCache
} from "@/services/coordinates/coordinates-cache";

interface UsePostcodeInputProps {
  onSelect: (postcode: string) => void;
}

export const usePostcodeInput = ({ onSelect }: UsePostcodeInputProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);
  const [prefetchedSuggestions, setPrefetchedSuggestions] = useState<Set<string>>(new Set());

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

  // Fetch suggestions when search term changes
  const { 
    data: suggestions = [], 
    isLoading, 
    isFetching, 
    error 
  } = useQuery({
    queryKey: ["postcode-suggestions", debouncedSearch],
    queryFn: () => fetchAddressSuggestions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Prefetch coordinates for suggestions to make searches faster
  useEffect(() => {
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return;
    }

    // Reset the prefetched suggestions
    setPrefetchedSuggestions(new Set());

    // Take the top 3 suggestions to prefetch
    const suggestionsToProcess = suggestions.slice(0, 3);
    let newPrefetchedSuggestions = new Set<string>();

    // Process each suggestion
    suggestionsToProcess.forEach(async (suggestion) => {
      const address = suggestion.address || suggestion.postcode || '';
      if (!address) return;

      // If coordinates are already cached, mark as prefetched
      if (hasCoordinatesInCache(address)) {
        newPrefetchedSuggestions.add(address);
        setPrefetchedSuggestions(prev => new Set([...prev, address]));
        return;
      }

      // Otherwise, fetch coordinates in the background
      try {
        // Determine the type of location
        const locationType = detectLocationType(address);
        
        // Fetch coordinates based on location type
        let coordinates: [number, number] | null = null;
        
        switch (locationType) {
          case 'PLACE_ID':
            coordinates = await fetchCoordinatesFromPlaceId(address);
            break;
          case 'LOCATION_NAME':
            coordinates = await fetchCoordinatesByLocationName(address);
            break;
          case 'POSTCODE':
            coordinates = await fetchCoordinatesFromPostcodesIo(address);
            break;
        }
        
        if (coordinates) {
          // Cache the coordinates
          cacheCoordinates(address, coordinates);
          
          // Mark as prefetched
          newPrefetchedSuggestions.add(address);
          setPrefetchedSuggestions(prev => new Set([...prev, address]));
        }
      } catch (error) {
        console.warn('Error prefetching coordinates for', address, error);
      }
    });
  }, [suggestions]);

  // Select handler with optimized coordinate resolution
  const handleSelect = useCallback(async (value: string) => {
    setSearch(value);
    setOpen(false);
    
    console.log('📍 Selected address:', value);
    
    // Always pass the selected value directly to onSelect
    // This ensures the search form gets the exact selection
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
    prefetchedSuggestions
  };
};
