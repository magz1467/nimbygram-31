
import { useQuery } from "@tanstack/react-query";
import { PostcodeSuggestion } from "@/types/address-suggestions";
import { fetchAddressSuggestions } from "@/services/address/postcode-autocomplete";
import { useDebounce } from "./use-debounce";

export interface UseAddressSuggestionsProps {
  input: string;
}

export const useAddressSuggestions = ({ input }: UseAddressSuggestionsProps) => {
  const debouncedSearch = useDebounce(input, 300);
  
  const { 
    data: suggestions = [], 
    isLoading, 
    isFetching,
    isError,
    isSuccess
  } = useQuery({
    queryKey: ["address-suggestions", debouncedSearch],
    queryFn: () => fetchAddressSuggestions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  } as any);

  return {
    suggestions,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    input,
    setInput: () => {}, // This is a placeholder since we're not using a state setter directly
  };
};
