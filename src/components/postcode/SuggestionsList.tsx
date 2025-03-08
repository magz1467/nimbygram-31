
import React from "react";
import { PostcodeSuggestion } from "@/types/address-suggestions";
import { Command } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import * as CommandPrimitive from "@/components/ui/command";

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
    isFetching
  });

  // Guard against undefined suggestions
  const hasSuggestions = suggestions && suggestions.length > 0;
  
  return (
    <div className="relative">
      <Command
        ref={commandRef}
        className="absolute top-2 z-10 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
      >
        <CommandPrimitive.CommandList className="max-h-60 overflow-auto p-2">
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
              <CommandPrimitive.CommandItem
                key={suggestion.postcode || suggestion.id || Math.random().toString()}
                value={suggestion.address || suggestion.postcode}
                onSelect={() => onSelect(suggestion.postcode || suggestion.address || '')}
                className="flex cursor-pointer flex-col p-2 text-sm hover:bg-gray-100"
              >
                <span className="font-medium">{suggestion.postcode}</span>
                <span className="text-xs text-gray-500">{suggestion.address || suggestion.admin_district}</span>
              </CommandPrimitive.CommandItem>
            ))
          )}
        </CommandPrimitive.CommandList>
      </Command>
    </div>
  );
};
