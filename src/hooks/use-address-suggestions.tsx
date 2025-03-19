
import { useQuery } from "@tanstack/react-query";
import { PostcodeSuggestion } from "@/types/address-suggestions";

export const useAddressSuggestions = (search: string) => {
  const { data: suggestions = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['address-suggestions', search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      
      try {
        // Simple UK postcode regex for basic validation
        const isPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(search);
        const isPartialPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i.test(search);
        
        if (isPostcodePattern || isPartialPostcode) {
          // Fetch from postcodes.io
          const response = await fetch(`https://api.postcodes.io/postcodes/${search}/autocomplete`);
          const data = await response.json();
          
          if (data.result) {
            return data.result.map((postcode: string) => ({
              postcode,
              address: postcode,
              county: '',
              district: ''
            }));
          }
        }
        
        // Return mock data for now
        return [
          { postcode: search, address: `${search}, London`, county: 'Greater London', district: 'Westminster' },
          { postcode: `${search} 1AA`, address: `123 ${search} Street`, county: 'Greater London', district: 'Camden' },
          { postcode: `${search} 2BB`, address: `${search} Park`, county: 'Greater London', district: 'Islington' }
        ];
      } catch (err) {
        console.error("Error fetching address suggestions:", err);
        return [];
      }
    },
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    suggestions,
    isLoading,
    error,
    isFetching
  };
};
