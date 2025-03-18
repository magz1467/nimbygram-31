import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  location?: {
    lat: number;
    lng: number;
  };
  // Add other properties as needed
}

interface SearchParams {
  query: string;
  location?: string;
  radius?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useApplicationSearch(initialParams: SearchParams) {
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [results, setResults] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const searchApplications = async () => {
      // Skip empty searches
      if (!params.query && !params.location) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Mock API call - replace with your actual API
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        
        const response = await fetch(`/api/applications/search?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to search applications');
        }
        
        const data = await response.json();
        setResults(data.applications || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(searchApplications, 500);
    
    return () => clearTimeout(timeoutId);
  }, [params]);

  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    results,
    loading,
    error,
    totalCount,
    params,
    updateSearchParams
  };
}