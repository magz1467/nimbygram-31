import { useState, useEffect } from 'react';

interface AddressSuggestion {
  id: string;
  text: string;
  description?: string;
}

export function useAddressSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip empty queries
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call - replace with your actual API
        const response = await fetch(`/api/address-suggestions?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch address suggestions');
        }
        
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { suggestions, loading, error };
}
