import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PostcodeSuggestion } from '../types/address-suggestions';
import { fetchAddressSuggestionsByPlacesAPI } from '../services/address/places-suggestions-service';

export const useAddressSuggestions = (search: string) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { toast } = useToast();
  
  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // For UK postcodes, make sure we directly use properly formatted input
  const isUkPostcode = (value: string) => {
    return /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s*[0-9][A-Z]{2})?$/i.test(value);
  };

  // Use React Query to fetch and cache suggestions
  return useQuery({
    queryKey: ['address-suggestions', debouncedSearch],
    queryFn: async (): Promise<PostcodeSuggestion[]> => {
      try {
        console.log('🔍 Fetching suggestions for:', debouncedSearch);
        const suggestions = await fetchAddressSuggestionsByPlacesAPI(debouncedSearch);
        
        // If we get no suggestions but it looks like a UK postcode,
        // create a direct suggestion
        if (suggestions.length === 0 && isUkPostcode(debouncedSearch)) {
          console.log('Creating direct UK postcode suggestion for:', debouncedSearch);
          return [{
            postcode: debouncedSearch.toUpperCase(),
            address: `${debouncedSearch.toUpperCase()} (Postcode)`,
            country: 'United Kingdom',
            locality: '',
            admin_district: '',
            nhs_ha: '',
            district: '',
            county: ''
          }];
        }
        
        return suggestions;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        
        // If it looks like a UK postcode, provide a fallback
        if (isUkPostcode(debouncedSearch)) {
          console.log('Creating fallback UK postcode after error for:', debouncedSearch);
          return [{
            postcode: debouncedSearch.toUpperCase(),
            address: `${debouncedSearch.toUpperCase()} (Postcode)`,
            country: 'United Kingdom',
            locality: '',
            admin_district: '',
            nhs_ha: '', 
            district: '',
            county: ''
          }];
        }
        
        // Only show toast for non-postcode errors
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
