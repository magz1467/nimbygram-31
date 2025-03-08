
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  
  const { data: suggestions = [], isLoading } = useAddressSuggestions(search);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const commandEl = document.querySelector('.postcode-command');
      if (commandEl && !commandEl.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = async (postcode: string, address?: string) => {
    console.log('📮 Selected location:', postcode, address);
    const displayValue = address && address.includes(postcode) 
      ? address 
      : (address || postcode);
    
    setSearch(displayValue);
    setOpen(false);
    await onSelect(postcode);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder={placeholder || "Enter postcode or street name"}
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
          onBlur={() => {
            // Delay closing to allow selecting an item
            setTimeout(() => {
              // Only close if we're not already submitting
              if (document.activeElement?.tagName !== 'BUTTON') {
                setOpen(false);
              }
            }, 250);
          }}
          aria-label="Search for a postcode or location"
        />
        <Button 
          type="button"
          size="icon" 
          variant="ghost" 
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => {
            if (search) onSelect(search);
          }}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {open && search.length >= 2 && (
        <div className="absolute z-[9999] w-full mt-1">
          <Command className="rounded-lg border shadow-md bg-white postcode-command">
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Loading suggestions...</CommandEmpty>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>No results found. Try a postcode or street name.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => {
                    // Create a unique key for each suggestion
                    const key = `${suggestion.postcode}-${suggestion.admin_district}-${index}`;
                    
                    return (
                      <CommandItem
                        key={key}
                        onSelect={() => handleSelect(suggestion.postcode, suggestion.address)}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        <div className="flex flex-col">
                          {suggestion.address ? (
                            <>
                              <span className="font-medium">{suggestion.address}</span>
                              <span className="text-sm text-gray-500">{suggestion.postcode}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{suggestion.postcode}</span>
                              <span className="text-sm text-gray-500">
                                {`${suggestion.admin_district || ''}, ${suggestion.country || 'UK'}`}
                              </span>
                            </>
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
