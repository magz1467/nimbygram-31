
import React, { useState, useEffect } from 'react';
import { Application } from '@/types/planning';
import { searchApplications, SearchParams } from '@/api/search';
import { useToast } from '@/hooks/use-toast';

export function useSearchState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const search = async (term: string, coords?: [number, number], radius?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: SearchParams = { query: term };
      
      // Add coordinates if provided
      if (coords && coords.length === 2) {
        params.latitude = coords[0];
        params.longitude = coords[1];
        params.radius = radius || 5;
      }
      
      const result = await searchApplications(params);
      
      setApplications(result.applications);
      setTotalResults(result.count);
      setSearchTerm(term);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoading || applications.length >= totalResults) return;
    
    setIsLoading(true);
    const nextPage = page + 1;
    
    try {
      const params: SearchParams = { 
        query: searchTerm,
        page: nextPage
      };
      
      const result = await searchApplications(params);
      
      setApplications([...applications, ...result.applications]);
      setPage(nextPage);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load more results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    search,
    loadMore,
    applications,
    isLoading,
    error,
    totalResults,
    hasMore: applications.length < totalResults
  };
}
