
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";

interface LocationSearchProps {
  location: string;
  onLocationChange: (value: string) => void;
  onLocationSelect: (location: string) => void;
}

export const LocationSearch = ({ location, onLocationChange, onLocationSelect }: LocationSearchProps) => {
  const { data: locationSuggestions = [], isLoading: isLoadingLocations } = useAddressSuggestions(location);

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Enter location (e.g., street, town, or city)"
          value={location}
          onValueChange={onLocationChange}
        />
        {location.length >= 2 && (
          <CommandList>
            {isLoadingLocations ? (
              <CommandEmpty>Loading suggestions...</CommandEmpty>
            ) : locationSuggestions.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {locationSuggestions.map((suggestion: any) => (
                  <CommandItem
                    key={suggestion.postcode}
                    value={suggestion.address || suggestion.postcode}
                    onSelect={onLocationSelect}
                    className="hover:bg-primary/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.address || suggestion.postcode}</span>
                      <span className="text-sm text-gray-500">
                        {suggestion.admin_district}, {suggestion.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
};
