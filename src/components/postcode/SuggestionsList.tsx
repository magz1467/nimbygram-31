
import React from "react";
import { PostcodeSuggestion } from "@/types/address-suggestions";
import { Command } from "@/components/ui/command";
import { Loader2, MapPin } from "lucide-react";
import { CommandList, CommandItem } from "@/components/ui/command";

interface SuggestionsListProps {
  isOpen: boolean;
  search: string;
  suggestions: PostcodeSuggestion[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onSelect: (value: string) => void;
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
  // Early return if not open
  if (!isOpen) {
    return null;
  }

  // For debugging
  console.log("SuggestionsList rendering with:", { 
    isOpen, 
    searchLength: search?.length,
    suggestionsCount: suggestions?.length || 0,
    isLoading,
    isFetching,
    error: error ? 'Error present' : 'No error',
    suggestions: suggestions || 'No suggestions'
  });

  // Check if we have valid suggestions
  const hasSuggestions = suggestions && Array.isArray(suggestions) && suggestions.length > 0;
  
  // Helper function to format location details
  const formatLocationDetails = (suggestion: PostcodeSuggestion) => {
    const parts = [];
    
    // For location names (towns, cities, etc.)
    if (suggestion.isLocationName) {
      if (suggestion.county) parts.push(suggestion.county);
      if (suggestion.locality) parts.push(suggestion.locality);
      return parts.join(', ');
    }
    
    // For postcodes
    if (suggestion.district) parts.push(suggestion.district);
    if (suggestion.county) parts.push(suggestion.county);
    if (suggestion.locality) parts.push(suggestion.locality);
    if (parts.length === 0 && suggestion.admin_district) parts.push(suggestion.admin_district);
    
    return parts.join(', ');
  };
  
  return (
    <Command
      ref={commandRef}
      className="w-full overflow-visible rounded-lg border border-gray-200 bg-white shadow-md z-50"
    >
      <CommandList className="max-h-[300px] overflow-auto p-2">
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">
            Error searching for locations. Please try again.
          </div>
        ) : !hasSuggestions ? (
          <div className="p-4 text-sm text-gray-500">
            {search.length < 2
              ? "Type at least 2 characters to search"
              : "No locations found. Try a different search term."}
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion.postcode + "-" + Math.random().toString(36).substr(2, 9)}
              value={suggestion.address || suggestion.postcode}
              onSelect={() => onSelect(suggestion.address || suggestion.postcode || '')}
              className="flex cursor-pointer flex-col items-start p-2 text-sm hover:bg-gray-100"
            >
              <div className="flex w-full items-center">
                <MapPin className="h-4 w-4 min-w-4 mr-2 text-gray-500" />
                <div className="flex flex-col items-start">
                  <div className="font-medium text-left">
                    {suggestion.postcode}
                  </div>
                  <div className="text-xs text-gray-500 text-left">
                    {formatLocationDetails(suggestion)}
                  </div>
                </div>
              </div>
            </CommandItem>
          ))
        )}
      </CommandList>
    </Command>
  );
};
