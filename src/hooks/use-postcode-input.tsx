
import { useState, useRef, useEffect } from "react";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";

export interface PostcodeInputProps {
  onSelect: (postcode: string) => void;
  initialValue?: string;
}

export const usePostcodeInput = ({ onSelect, initialValue = "" }: PostcodeInputProps) => {
  const [search, setSearch] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  
  const { data: suggestions = [], isLoading, isFetching, error } = useAddressSuggestions(search);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Add both mouse and touch events for better mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle UK postcode pattern detection
  const isUkPostcode = (value: string) => {
    // Simplified UK postcode regex
    return /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s*[0-9][A-Z]{2})?$/i.test(value);
  };

  const handleSelect = async (postcode: string, address?: string) => {
    console.log('📮 Selected location:', postcode, address);
    const displayValue = address || postcode;
    
    setSearch(displayValue);
    setOpen(false);
    
    // Always pass the full postcode/place ID
    await onSelect(postcode);
  };

  const handleSearchClick = () => {
    if (search.trim()) {
      // Check if this might be a Google Place ID from our suggestions
      const matchingSuggestion = suggestions.find(s => 
        s.address === search.trim() || 
        s.postcode === search.trim()
      );
      
      if (matchingSuggestion) {
        // Use the suggestion's postcode or place ID
        onSelect(matchingSuggestion.postcode);
      } else if (isUkPostcode(search.trim())) {
        // If it looks like a valid UK postcode, use it directly
        console.log('Direct postcode search:', search.trim());
        onSelect(search.trim().toUpperCase());
      } else {
        // Just use the raw input
        onSelect(search.trim());
      }
    }
  };

  const handleInputChange = (value: string) => {
    setSearch(value);
    if (value.length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return {
    search,
    setSearch,
    open,
    setOpen,
    inputRef,
    commandRef,
    suggestions,
    isLoading,
    isFetching,
    error,
    handleSelect,
    handleSearchClick,
    handleInputChange,
    isUkPostcode,
  };
};
