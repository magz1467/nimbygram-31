
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PostcodeSearchProps {
  onSelect: (postcode: string) => void;
  placeholder?: string;
  className?: string;
}

export const PostcodeSearch = ({ onSelect, placeholder = "Search location", className = "" }: PostcodeSearchProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  
  const { data: suggestions = [], isLoading, isFetching, error } = useAddressSuggestions(search);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  // Determine if we should show the loading state
  const isSearching = isLoading || isFetching;

  // Determine the empty state message based on error status
  const getEmptyStateMessage = () => {
    if (error) {
      return "Unable to load suggestions. Please enter a postcode manually.";
    }
    if (search.length < 2) {
      return "Enter at least 2 characters to search";
    }
    if (isUkPostcode(search) && suggestions.length === 0) {
      return `Press Enter to search for "${search.toUpperCase()}"`;
    }
    return "No results found. Try a postcode, street name or area.";
  };

  // Format location information for display
  const formatLocationInfo = (suggestion: any) => {
    const parts = [];
    
    // Add locality if it exists and is not already in the address
    if (suggestion.locality && !suggestion.address?.includes(suggestion.locality)) {
      parts.push(suggestion.locality);
    }
    
    // Add district if it exists and is not already covered
    if (suggestion.district && 
        !parts.includes(suggestion.district) && 
        !suggestion.address?.includes(suggestion.district)) {
      parts.push(suggestion.district);
    }
    
    // Add county
    if (suggestion.county && 
        !parts.includes(suggestion.county) && 
        !suggestion.address?.includes(suggestion.county)) {
      parts.push(suggestion.county);
    }
    
    // Add UK instead of United Kingdom for brevity
    if (suggestion.country === 'United Kingdom') {
      parts.push('UK');
    } else if (suggestion.country && suggestion.country !== 'United Kingdom') {
      parts.push(suggestion.country);
    }
    
    return parts.filter(Boolean).join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter postcode, street name or area"}
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            if (value.length >= 2) {
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
          className="w-full pl-4 pr-10 py-2"
          onFocus={() => search.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchClick();
            }
          }}
          aria-label="Search for a postcode or location"
        />
        <Button 
          type="button"
          size="icon" 
          variant="ghost" 
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label="Search"
          onClick={handleSearchClick}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {open && search.length >= 2 && (
        <div className="absolute z-[9999] w-full mt-1">
          <Command ref={commandRef} className="rounded-lg border shadow-md bg-white postcode-command">
            <CommandList>
              {isSearching ? (
                <CommandEmpty>Loading suggestions...</CommandEmpty>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>
                  {getEmptyStateMessage()}
                  {isUkPostcode(search) && (
                    <div className="mt-2 text-sm text-primary">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-1"
                        onClick={() => handleSelect(search.toUpperCase(), `${search.toUpperCase()} (Postcode)`)}
                      >
                        Search {search.toUpperCase()}
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => {
                    // Create a unique key for each suggestion
                    const key = `suggestion-${index}`;
                    
                    // Check if this suggestion has a place ID instead of a real postcode
                    const isPlaceId = suggestion.isPlaceId || 
                      (suggestion.postcode && suggestion.postcode.length > 15 && 
                       !suggestion.postcode.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i));
                    
                    // Format location information
                    const locationInfo = formatLocationInfo(suggestion);
                    
                    return (
                      <CommandItem
                        key={key}
                        onSelect={() => handleSelect(suggestion.postcode, suggestion.address)}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{suggestion.address}</span>
                          {!isPlaceId && suggestion.postcode && !suggestion.address?.includes(suggestion.postcode) && (
                            <span className="text-sm text-gray-500">{suggestion.postcode}</span>
                          )}
                          
                          {/* Display enhanced location information */}
                          {locationInfo && (
                            <span className="text-sm text-gray-500">{locationInfo}</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
