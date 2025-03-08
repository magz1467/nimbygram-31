
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

  // Use React Query to fetch and cache suggestions
  return useQuery({
    queryKey: ['address-suggestions', debouncedSearch],
    queryFn: async (): Promise<PostcodeSuggestion[]> => {
      try {
        return await fetchAddressSuggestionsByPlacesAPI(debouncedSearch);
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
