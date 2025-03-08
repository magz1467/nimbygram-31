
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface PostcodeSuggestion {
  postcode: string;
  country: string;
  nhs_ha: string;
  admin_district: string;
  address?: string;
}

export const useAddressSuggestions = (search: string) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return useQuery({
    queryKey: ['address-suggestions', debouncedSearch],
    queryFn: async (): Promise<PostcodeSuggestion[]> => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      
      try {
        const suggestions: PostcodeSuggestion[] = [];
        
        // Try to determine if input is a postcode or address
        const isPostcodeLike = /^[A-Z]{1,2}[0-9][A-Z0-9]?/i.test(debouncedSearch.trim().toUpperCase());
        
        // Try general search first since it works for both postcodes and addresses
        const searchUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(debouncedSearch)}`;
        console.log('🔍 Trying general search:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.result && Array.isArray(searchData.result)) {
            const searchResults = searchData.result.map((result: any) => ({
              ...result,
              postcode: result.postcode,
              address: [
                result.admin_ward,
                result.parish,
                result.admin_district,
                result.postcode
              ].filter(Boolean).join(', ')
            }));
            suggestions.push(...searchResults);
          }
        }
        
        // If it looks like a postcode and we didn't get results yet, try postcode autocomplete
        if (isPostcodeLike && suggestions.length === 0) {
          const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(debouncedSearch)}/autocomplete`;
          console.log('🔍 Fetching postcode autocomplete:', autocompleteUrl);
          
          const autocompleteResponse = await fetch(autocompleteUrl);
          const autocompleteData = await autocompleteResponse.json();
          
          if (autocompleteData.result && Array.isArray(autocompleteData.result)) {
            // Fetch details for each suggested postcode
            const detailsPromises = autocompleteData.result.map(async (postcode) => {
              try {
                const detailsResponse = await fetch(
                  `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
                );
                
                if (detailsResponse.ok) {
                  const details = await detailsResponse.json();
                  if (details.result) {
                    return {
                      ...details.result,
                      postcode: details.result.postcode,
                      address: [
                        details.result.admin_ward,
                        details.result.parish,
                        details.result.admin_district,
                        details.result.postcode
                      ].filter(Boolean).join(', ')
                    };
                  }
                }
                return null;
              } catch (error) {
                console.error('Error fetching postcode details:', error);
                return null;
              }
            });

            const results = await Promise.all(detailsPromises);
            const validResults = results.filter((result): result is PostcodeSuggestion => result !== null);
            suggestions.push(...validResults);
          }
        }
        
        console.log('📍 Found suggestions:', suggestions.length);
        return suggestions;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: "Error",
          description: "Unable to fetch location suggestions. Please try again.",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
