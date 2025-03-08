
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
        
        // Always try general search first since it works for both postcodes and addresses
        const searchUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(debouncedSearch)}`;
        console.log('🔍 Trying general search:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.result && Array.isArray(searchData.result) && searchData.result.length > 0) {
            console.log('📍 Found general search results:', searchData.result.length);
            
            // Format the search results with better address display
            const searchResults = searchData.result.map((result: any) => {
              // Create a more detailed address string
              const addressParts = [
                result.nhs_ha,
                result.admin_ward,
                result.parish,
                result.admin_district,
                result.admin_county,
                result.country
              ].filter(Boolean);
              
              return {
                ...result,
                postcode: result.postcode,
                address: addressParts.length > 0 
                  ? `${addressParts.join(', ')}, ${result.postcode}`
                  : result.postcode
              };
            });
            
            suggestions.push(...searchResults);
          }
        }
        
        // If it looks like a postcode and we didn't get results, try postcode autocomplete
        if (isPostcodeLike && suggestions.length === 0) {
          const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(debouncedSearch)}/autocomplete`;
          console.log('🔍 Fetching postcode autocomplete:', autocompleteUrl);
          
          const autocompleteResponse = await fetch(autocompleteUrl);
          const autocompleteData = await autocompleteResponse.json();
          
          if (autocompleteData.result && Array.isArray(autocompleteData.result)) {
            console.log('📍 Found postcode autocomplete results:', autocompleteData.result.length);
            
            // Fetch details for each suggested postcode
            const detailsPromises = autocompleteData.result.map(async (postcode) => {
              try {
                const detailsResponse = await fetch(
                  `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
                );
                
                if (detailsResponse.ok) {
                  const details = await detailsResponse.json();
                  if (details.result) {
                    // Create a more detailed address string
                    const addressParts = [
                      details.result.nhs_ha,
                      details.result.admin_ward,
                      details.result.parish,
                      details.result.admin_district,
                      details.result.admin_county,
                      details.result.country
                    ].filter(Boolean);
                    
                    return {
                      ...details.result,
                      postcode: details.result.postcode,
                      address: addressParts.length > 0 
                        ? `${addressParts.join(', ')}, ${details.result.postcode}`
                        : details.result.postcode
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
        
        // For non-postcode searches that didn't yield results, try a place lookup
        if (!isPostcodeLike && suggestions.length === 0 && debouncedSearch.length >= 3) {
          // Use a place lookup approach with outcode
          try {
            // First try to find the outcode (first part of postcode)
            const outcodeUrl = `https://api.postcodes.io/outcodes?q=${encodeURIComponent(debouncedSearch)}`;
            console.log('🔍 Trying outcode search:', outcodeUrl);
            
            const outcodeResponse = await fetch(outcodeUrl);
            if (outcodeResponse.ok) {
              const outcodeData = await outcodeResponse.json();
              
              if (outcodeData.result && Array.isArray(outcodeData.result) && outcodeData.result.length > 0) {
                console.log('📍 Found outcode results:', outcodeData.result.length);
                
                // Add outcode results as suggestions
                const outcodeResults = outcodeData.result.map((result: any) => ({
                  ...result,
                  postcode: result.outcode,
                  address: `${result.admin_district}, ${result.admin_county || result.region}`,
                  nhs_ha: result.nhs_ha || '',
                  country: result.country || 'England',
                  admin_district: result.admin_district || ''
                }));
                
                suggestions.push(...outcodeResults);
              }
            }
          } catch (error) {
            console.error('Error in outcode search:', error);
            // Continue with other searches even if this fails
          }
        }
        
        // Make sure we have unique suggestions based on postcode
        const uniqueSuggestions: PostcodeSuggestion[] = [];
        const postcodes = new Set<string>();
        
        suggestions.forEach(suggestion => {
          if (!postcodes.has(suggestion.postcode)) {
            postcodes.add(suggestion.postcode);
            uniqueSuggestions.push(suggestion);
          }
        });
        
        console.log('📍 Final suggestion count:', uniqueSuggestions.length);
        return uniqueSuggestions;
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
