
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
        
        // First try the autocomplete endpoint for partial postcodes
        const autocompleteResponse = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(debouncedSearch)}/autocomplete`
        );
        
        if (autocompleteResponse.ok) {
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
                      address: `${details.result.admin_ward || ''}, ${details.result.parish || ''} ${details.result.admin_district || ''}, ${details.result.postcode}`.trim()
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
            suggestions.push(...results.filter((result): result is PostcodeSuggestion => result !== null));
          }
        } else if (autocompleteResponse.status !== 404) {
          // Only try general search if autocomplete failed for reasons other than 404
          const generalResponse = await fetch(
            `https://api.postcodes.io/postcodes?q=${encodeURIComponent(debouncedSearch)}`
          );
          
          if (generalResponse.ok) {
            const generalData = await generalResponse.json();
            
            if (generalData.result && Array.isArray(generalData.result)) {
              suggestions.push(...generalData.result.map((result: any) => ({
                ...result,
                postcode: result.postcode,
                address: `${result.admin_ward || ''}, ${result.parish || ''} ${result.admin_district || ''}, ${result.postcode}`.trim()
              })));
            }
          }
        }
        
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
    initialData: [], // Always initialize with empty array
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
