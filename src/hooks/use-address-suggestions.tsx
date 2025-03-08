
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PostcodeSuggestion } from '@/types/address-suggestions';
import { fetchAddressSuggestions } from '@/services/address/postcode-autocomplete';
import { fetchAddressSuggestionsByPlacesAPI } from '@/services/address/google-places-service';
import { useDebounce } from './use-debounce';

interface UseAddressSuggestionsProps {
  initialValue?: string;
  minLength?: number;
  debounceMs?: number;
}

export function useAddressSuggestions({
  initialValue = '',
  minLength = 2,
  debounceMs = 300
}: UseAddressSuggestionsProps = {}) {
  const [input, setInput] = useState(initialValue);
  const debouncedInput = useDebounce(input, debounceMs);
  const [suggestions, setSuggestions] = useState<PostcodeSuggestion[]>([]);
  const { toast } = useToast();

  // Use query for postcode suggestions
  const postcodeQuery = useQuery({
    queryKey: ['postcode-suggestions', debouncedInput],
    queryFn: () => fetchAddressSuggestions(debouncedInput),
    enabled: debouncedInput.length >= minLength,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1
  });

  // Use query for Google Places suggestions
  const placesQuery = useQuery({
    queryKey: ['places-suggestions', debouncedInput],
    queryFn: () => fetchAddressSuggestionsByPlacesAPI(debouncedInput),
    enabled: debouncedInput.length >= minLength,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1
  });

  // Combine suggestions from both sources
  useEffect(() => {
    const postcodeResults = postcodeQuery.data || [];
    const placesResults = placesQuery.data || [];
    
    // Combine and deduplicate results
    const combinedResults = [...postcodeResults];
    
    // Add places results that don't duplicate postcodes
    placesResults.forEach(placeResult => {
      if (!combinedResults.some(pr => pr.postcode === placeResult.postcode)) {
        combinedResults.push(placeResult);
      }
    });
    
    setSuggestions(combinedResults);
  }, [postcodeQuery.data, placesQuery.data]);

  // Show error toast if both queries fail
  useEffect(() => {
    if (postcodeQuery.isError && placesQuery.isError && debouncedInput.length >= minLength) {
      toast({
        title: "Error loading suggestions",
        description: "Could not load address suggestions. Please try typing a valid UK postcode.",
        variant: "destructive"
      });
    }
  }, [postcodeQuery.isError, placesQuery.isError, toast, debouncedInput, minLength]);

  return {
    input,
    setInput,
    suggestions: suggestions || [],
    isLoading: postcodeQuery.isLoading || placesQuery.isLoading,
    isError: postcodeQuery.isError && placesQuery.isError,
    isSuccess: postcodeQuery.isSuccess || placesQuery.isSuccess
  };
}
