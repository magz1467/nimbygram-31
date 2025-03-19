
import { useState, useCallback, useRef } from "react";
import { useAddressSuggestions } from "./use-address-suggestions";

interface UsePostcodeInputProps {
  onSelect?: (postcode: string, isLocationName?: boolean) => void;
  initialValue?: string;
}

export const usePostcodeInput = ({ 
  onSelect = () => {}, 
  initialValue = "" 
}: UsePostcodeInputProps = {}) => {
  const [search, setSearch] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  
  // Use the updated hook with proper parameters
  const { suggestions, isLoading, error, isFetching } = useAddressSuggestions(search);

  const handleInputChange = useCallback((value: string) => {
    setSearch(value);
    setSelectedSuggestion(null);
    setOpen(value.length >= 2);
  }, []);

  const handleSelect = useCallback((suggestion: string, isLocationName?: boolean) => {
    setSearch(suggestion);
    setSelectedSuggestion(suggestion);
    setOpen(false);
    onSelect(suggestion, isLocationName);
  }, [onSelect]);

  const handleSearchClick = useCallback(() => {
    if (search.length >= 2) {
      onSelect(search);
      setOpen(false);
    }
  }, [search, onSelect]);

  return {
    postcode: search,
    search,
    open,
    inputRef,
    commandRef,
    suggestions,
    isLoading,
    error: !!error,
    isFetching,
    isError: !!error,
    selectedSuggestion,
    handleSelect,
    handleSearchClick,
    handleInputChange,
    setPostcode: handleInputChange
  };
};
