
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";

interface LocationSearchProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationSelect: (location: string) => void;
}

export const LocationSearch = ({ location, onLocationChange, onLocationSelect }: LocationSearchProps) => {
  const { data: suggestions = [], isLoading: isLoadingLocations } = useAddressSuggestions(location);

  // Ensure suggestions is always an array
  const locationSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Enter location (e.g., street, town, or city)"
          value={location || ''}
          onValueChange={onLocationChange}
        />
        {location.length >= 2 && (
          <CommandList>
            {isLoadingLocations ? (
              <CommandEmpty>Loading suggestions...</CommandEmpty>
            ) : locationSuggestions.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup heading="Locations">
                {locationSuggestions.map((suggestion) => {
                  const address = suggestion?.address || suggestion?.postcode || '';
                  const key = `${suggestion?.postcode}-${suggestion?.admin_district}-${Date.now()}`;
                  
                  if (!address) return null;
                  
                  return (
                    <CommandItem
                      key={key}
                      value={address}
                      onSelect={(value) => {
                        if (value) onLocationSelect(value);
                      }}
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {address}
                        </span>
                        {(suggestion?.admin_district || suggestion?.country) && (
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
          </CommandList>
        )}
      </Command>
    </div>
  );
};
