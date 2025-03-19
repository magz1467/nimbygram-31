
import { useState, useCallback } from "react";
import { useAddressSuggestions } from "./use-address-suggestions";

export const usePostcodeInput = () => {
  const [postcode, setPostcode] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Use the updated hook with proper parameters
  const { suggestions, isLoading, error } = useAddressSuggestions(postcode);

  const handleInputChange = useCallback((value: string) => {
    setPostcode(value);
    setSelectedSuggestion(null);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setPostcode(suggestion);
    setSelectedSuggestion(suggestion);
  }, []);

  return {
    postcode,
    setPostcode: handleInputChange,
    suggestions,
    isLoading,
    error: !!error,
    isFetching: isLoading,
    isError: !!error,
    selectedSuggestion,
    handleSelectSuggestion,
  };
};
