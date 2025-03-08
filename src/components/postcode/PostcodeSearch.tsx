
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { usePostcodeInput } from "@/hooks/use-postcode-input";
import { SuggestionsList } from "./SuggestionsList";

interface PostcodeSearchProps {
  onSelect: (postcode: string) => void;
  placeholder?: string;
  className?: string;
}

export const PostcodeSearch = ({ 
  onSelect, 
  placeholder = "Search location", 
  className = "" 
}: PostcodeSearchProps) => {
  const {
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
  } = usePostcodeInput({ onSelect });

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter postcode, street name or area"}
          value={search}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2"
          onFocus={() => search.length >= 2 && open === false && handleInputChange(search)}
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

      <SuggestionsList
        isOpen={open}
        search={search}
        suggestions={suggestions}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onSelect={handleSelect}
        commandRef={commandRef}
      />
    </div>
  );
};
