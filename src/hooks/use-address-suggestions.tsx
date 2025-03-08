
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
        const searchTerm = debouncedSearch.trim();
        
        // Try to determine if input is a postcode or address
        const isPostcodeLike = /^[A-Z]{1,2}[0-9][A-Z0-9]?/i.test(searchTerm.toUpperCase());
        
        console.log('🔍 Searching for:', searchTerm, 'isPostcodeLike:', isPostcodeLike);
        
        // For non-postcode searches (addresses, streets), try place search first
        if (!isPostcodeLike && searchTerm.length >= 3) {
          try {
            // Use OS OpenNames API for address search
            const addressUrl = `https://api.os.uk/search/names/v1/find?query=${encodeURIComponent(searchTerm)}&key=${process.env.OS_API_KEY || 'ZTEafpzqZzMQXvUiMJFqnkEhdXrLbsLp'}`;
            console.log('🔍 Trying address search:', addressUrl);
            
            const addressResponse = await fetch(addressUrl);
            if (addressResponse.ok) {
              const addressData = await addressResponse.json();
              
              if (addressData.results && Array.isArray(addressData.results) && addressData.results.length > 0) {
                console.log('📍 Found address results:', addressData.results.length);
                
                // Process address results into our format
                const addressResults = addressData.results.slice(0, 10).map((result: any) => {
                  // Format address with available info
                  const addressParts = [
                    result.DISTRICT_BOROUGH,
                    result.COUNTY_UNITARY,
                    result.REGION,
                    result.COUNTRY
                  ].filter(Boolean);
                  
                  // If we have a postcode in the result, use it
                  const postcode = result.POSTCODE || 'Unknown';
                  
                  return {
                    postcode: postcode,
                    country: result.COUNTRY || 'United Kingdom',
                    nhs_ha: '',
                    admin_district: result.DISTRICT_BOROUGH || '',
                    address: `${result.NAME || ''}, ${addressParts.join(', ')}${postcode ? `, ${postcode}` : ''}`
                  };
                });
                
                suggestions.push(...addressResults);
              }
            }
          } catch (error) {
            console.error('Error in address search:', error);
            // Continue with other searches even if this fails
          }
          
          // If we didn't get any results, try an outcode search
          if (suggestions.length === 0) {
            try {
              // Try to find the outcode (first part of postcode)
              const outcodeUrl = `https://api.postcodes.io/outcodes?q=${encodeURIComponent(searchTerm)}`;
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
                    address: `${result.outcode}, ${result.admin_district || ''}, ${result.admin_county || result.region || ''}`,
                    nhs_ha: result.nhs_ha || '',
                    country: result.country || 'United Kingdom',
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
          
          // If we still don't have results, try a partial postcode search
          if (suggestions.length === 0) {
            try {
              // Try a general postcode search
              const postcodeUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(searchTerm)}`;
              console.log('🔍 Trying general postcode search:', postcodeUrl);
              
              const postcodeResponse = await fetch(postcodeUrl);
              if (postcodeResponse.ok) {
                const postcodeData = await postcodeResponse.json();
                
                if (postcodeData.result && Array.isArray(postcodeData.result) && postcodeData.result.length > 0) {
                  console.log('📍 Found general postcode results:', postcodeData.result.length);
                  
                  // Format the search results with better address display
                  const postcodeResults = postcodeData.result.map((result: any) => {
                    // Create a more detailed address string
                    const addressParts = [
                      result.parish || '',
                      result.admin_ward || '',
                      result.admin_district || '',
                      result.admin_county || '',
                      result.country || 'United Kingdom'
                    ].filter(Boolean);
                    
                    return {
                      ...result,
                      postcode: result.postcode,
                      address: `${addressParts.join(', ')}, ${result.postcode}`
                    };
                  });
                  
                  suggestions.push(...postcodeResults);
                }
              }
            } catch (error) {
              console.error('Error in general postcode search:', error);
              // Continue even if this search fails
            }
          }
        }
        
        // If it looks like a postcode or we still don't have results, try postcode-specific searches
        if (isPostcodeLike || suggestions.length === 0) {
          // Always try general search for postcodes
          const searchUrl = `https://api.postcodes.io/postcodes?q=${encodeURIComponent(searchTerm)}`;
          console.log('🔍 Trying general postcode search:', searchUrl);
          
          const searchResponse = await fetch(searchUrl);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
            if (searchData.result && Array.isArray(searchData.result) && searchData.result.length > 0) {
              console.log('📍 Found general search results:', searchData.result.length);
              
              // Format the search results with better address display
              const searchResults = searchData.result.map((result: any) => {
                // Create a more detailed address string
                const addressParts = [
                  result.parish || '',
                  result.admin_ward || '',
                  result.admin_district || '',
                  result.admin_county || '',
                  result.country || 'United Kingdom'
                ].filter(Boolean);
                
                return {
                  ...result,
                  postcode: result.postcode,
                  address: `${addressParts.join(', ')}, ${result.postcode}`
                };
              });
              
              suggestions.push(...searchResults);
            }
          }
          
          // If it looks more like a postcode and we have few results, try postcode autocomplete
          if (isPostcodeLike && suggestions.length < 5) {
            const autocompleteUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(searchTerm)}/autocomplete`;
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
                        details.result.parish || '',
                        details.result.admin_ward || '',
                        details.result.admin_district || '',
                        details.result.admin_county || '',
                        details.result.country || 'United Kingdom'
                      ].filter(Boolean);
                      
                      return {
                        ...details.result,
                        postcode: details.result.postcode,
                        address: `${addressParts.join(', ')}, ${details.result.postcode}`
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
        }
        
        // Make sure we have unique suggestions based on address
        const uniqueSuggestions: PostcodeSuggestion[] = [];
        const addresses = new Set<string>();
        
        suggestions.forEach(suggestion => {
          const addressKey = suggestion.address || suggestion.postcode;
          if (!addresses.has(addressKey)) {
            addresses.add(addressKey);
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
