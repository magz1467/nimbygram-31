
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
          className="w-full pl-4 pr-10 py-2 h-12" /* Increased height for better touch targets */
          onFocus={() => search.length >= 2 && open === false && handleInputChange(search)}
          onTouchStart={() => search.length >= 2 && open === false && handleInputChange(search)}
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
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10" /* Increased size for better touch target */
          aria-label="Search"
          onClick={handleSearchClick}
        >
          <Search className="h-5 w-5" /> {/* Slightly larger icon */}
        </Button>
      </div>

      {/* Fix positioning to show suggestions above other content */}
      <div className="absolute left-0 right-0 mt-1 z-50">
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
    </div>
  );
};
