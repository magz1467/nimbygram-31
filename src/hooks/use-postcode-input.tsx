
import { useRef, useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { PostcodeSuggestion } from "@/types/address-suggestions";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";

interface UsePostcodeInputProps {
  onSelect: (value: string) => void;
  initialValue?: string;
}

export const usePostcodeInput = ({ onSelect, initialValue = "" }: UsePostcodeInputProps) => {
  const [search, setSearch] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  // Get address suggestions based on the debounced search
  const {
    suggestions,
    isLoading,
    isFetching,
    error
  } = useAddressSuggestions(debouncedSearch, open);

  // Set the initial value when it changes
  useEffect(() => {
    if (initialValue && initialValue !== search) {
      setSearch(initialValue);
    }
  }, [initialValue]);

  // Handle closing suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search change
  const handleInputChange = (value: string) => {
    setSearch(value);
    setOpen(value.length >= 2);
  };

  // Handle selecting a suggestion
  const handleSelect = (value: string) => {
    setSearch(value);
    setOpen(false);
    onSelect(value);
  };

  // Handle clicking the search button
  const handleSearchClick = () => {
    if (search && search.length > 0) {
      setOpen(false);
      onSelect(search);
    }
  };

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
