
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
  error: boolean | null; // Changed from Error to boolean
  onSelect: (value: string, isLocationName?: boolean) => void;
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
  if (!isOpen) {
    return null;
  }

  const hasSuggestions = suggestions && suggestions.length > 0;
  
  return (
    <Command
      ref={commandRef}
      className="w-full rounded-lg border border-gray-200 bg-white shadow-md z-50"
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
              onSelect={() => onSelect(
                suggestion.address || suggestion.postcode || '', 
                !!suggestion.isLocationName
              )}
              className="flex cursor-pointer items-center p-2 text-sm hover:bg-gray-100"
            >
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <div className="font-medium">{suggestion.postcode}</div>
                <div className="text-xs text-gray-500">
                  {suggestion.county || suggestion.district || ''}
                </div>
              </div>
            </CommandItem>
          ))
        )}
      </CommandList>
    </Command>
  );
};
