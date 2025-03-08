
import { useRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { PostcodeSuggestion } from "@/types/address-suggestions";

interface SuggestionsListProps {
  isOpen: boolean;
  search: string;
  suggestions: PostcodeSuggestion[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onSelect: (postcode: string, address?: string) => void;
  commandRef: React.RefObject<HTMLDivElement>;
}

export const SuggestionsList = ({
  isOpen,
  search,
  suggestions,
  isLoading,
  isFetching,
  error,
  onSelect,
  commandRef,
}: SuggestionsListProps) => {
  // Handle UK postcode pattern detection
  const isUkPostcode = (value: string) => {
    // Simplified UK postcode regex
    return /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s*[0-9][A-Z]{2})?$/i.test(value);
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
  const formatLocationInfo = (suggestion: PostcodeSuggestion) => {
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

  if (!isOpen || search.length < 2) {
    return null;
  }

  return (
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
                    onClick={() => onSelect(search.toUpperCase(), `${search.toUpperCase()} (Postcode)`)}
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
                    onSelect={() => onSelect(suggestion.postcode, suggestion.address)}
                    className="cursor-pointer hover:bg-primary/10 py-3"
                    data-mobile-selectable="true"
                  >
                    <div className="flex flex-col w-full">
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
  );
};
