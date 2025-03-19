
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useSearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Parse search params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postcode = searchParams.get('postcode');
    
    if (postcode) {
      setSearchTerm(postcode);
    }
  }, [location.search]);
  
  // Handle the search functionality
  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Update URL with search term
      const params = new URLSearchParams();
      params.set('postcode', term);
      navigate(`/search-results?${params.toString()}`);
    } catch (err) {
      // Type guard for the error
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  return {
    searchTerm,
    isSearching,
    error,
    handleSearch,
  };
};
