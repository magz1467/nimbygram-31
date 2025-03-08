
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchAddressSuggestionsByPlacesAPI } from "@/services/address/places-suggestions-service";
import { PostcodeSuggestion } from "@/types/address-suggestions";

export interface UseAddressSuggestionsProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSelect?: (address: string) => void;
  enabled?: boolean;
  debounceMs?: number;
}

export const useAddressSuggestions = ({
  input,
  setInput,
  onSelect,
  enabled = true,
  debounceMs = 300,
}: UseAddressSuggestionsProps) => {
  const debouncedInput = useDebounce(input, debounceMs);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PostcodeSuggestion | null>(null);

  const {
    data: suggestions = [],
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["address-suggestions", debouncedInput],
    queryFn: () => fetchAddressSuggestionsByPlacesAPI(debouncedInput),
    enabled: enabled && debouncedInput.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleSuggestionSelect = (suggestion: PostcodeSuggestion) => {
    setSelectedSuggestion(suggestion);
    setInput(suggestion.postcode || suggestion.address);
    if (onSelect) {
      onSelect(suggestion.postcode || suggestion.address);
    }
  };

  return {
    input,
    setInput,
    suggestions,
    isLoading,
    isError,
    isSuccess,
    selectedSuggestion,
    handleSuggestionSelect,
  };
};
