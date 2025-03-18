
import { Application } from "@/types/planning";
// Remove incorrect import from '@/api/search'

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SearchState {
  searchTerm: string;
  applications: Application[];
  isLoading: boolean;
  error: Error | null;
}

export const useSearchState = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [state, setState] = useState<SearchState>({
    searchTerm: initialSearch,
    applications: [],
    isLoading: false,
    error: null
  });

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setApplications = useCallback((apps: Application[]) => {
    setState(prev => ({ ...prev, applications: apps }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Reset search state when URL search param changes
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch, setSearchTerm]);

  return {
    ...state,
    setSearchTerm,
    setApplications,
    setLoading,
    setError,
  };
};
