
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";
import { useState } from "react";

interface LocationSearchProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationSelect: (location: string) => void;
}

export const LocationSearch = ({ location, onLocationChange, onLocationSelect }: LocationSearchProps) => {
  const [open, setOpen] = useState(false);
  const { suggestions = [], isLoading } = useAddressSuggestions({
    input: location,
  });

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Enter location (e.g., street, town, or city)"
          value={location}
          onValueChange={(value) => {
            onLocationChange(value);
            if (value.length >= 2) {
              setOpen(true);
            }
          }}
          onFocus={() => location.length >= 2 && setOpen(true)}
        />
        {open && (
          <CommandList>
            {location.length >= 2 ? (
              <>
                {isLoading ? (
                  <CommandEmpty>Loading suggestions...</CommandEmpty>
                ) : suggestions && suggestions.length === 0 ? (
                  <CommandEmpty>No results found.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Locations">
                    {(suggestions || []).map((suggestion) => {
                      if (!suggestion?.address && !suggestion?.postcode) return null;
                      
                      const address = suggestion.address || suggestion.postcode;
                      const key = `${suggestion.postcode}-${suggestion.admin_district}-${Date.now()}`;
                      
                      return (
                        <CommandItem
                          key={key}
                          value={address}
                          onSelect={(value) => {
                            if (value) {
                              onLocationSelect(value);
                              setOpen(false);
                            }
                          }}
                          className="cursor-pointer hover:bg-primary/10"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{address}</span>
                            {(suggestion.admin_district || suggestion.country) && (
                              <span className="text-sm text-gray-500">
                                {[suggestion.admin_district, suggestion.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            ) : null}
          </CommandList>
        )}
      </Command>
    </div>
  );
};
