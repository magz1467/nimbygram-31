
import { useState } from "react";
import { useAddressSuggestions } from "@/hooks/use-address-suggestions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface LocationSearchProps {
  onSearch: (location: string) => void;
}

export const LocationSearch = ({ onSearch }: LocationSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { suggestions, isLoading } = useAddressSuggestions(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      onSearch(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Enter postcode or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
            {suggestions.map((suggestion: any, index: number) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchTerm(suggestion.address);
                  onSearch(suggestion.address);
                }}
              >
                {suggestion.address}
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading || !searchTerm}>
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
};
