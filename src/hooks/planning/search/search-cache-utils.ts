
import { QueryClient } from '@tanstack/react-query';

/**
 * Utility functions to manage search query caching
 */

// Prefix for all search-related query keys
const SEARCH_QUERY_KEY_PREFIX = 'planning-applications';

/**
 * Creates a consistent query key for React Query caching based on search parameters
 */
export const createSearchQueryKey = (
  searchParam: [number, number] | string | null,
  filters: Record<string, any> = {},
  radius: number = 5
): string[] => {
  if (!searchParam) return [SEARCH_QUERY_KEY_PREFIX, 'no-coordinates'];
  
  const filterString = JSON.stringify(filters);
  const radiusString = radius.toString();
  
  // Generate a consistent key string based on the type of searchParam
  const searchParamString = typeof searchParam === 'string' 
    ? `postcode:${searchParam}` 
    : `coords:${searchParam.join(',')}`;
  
  return [SEARCH_QUERY_KEY_PREFIX, searchParamString, filterString, radiusString];
};

/**
 * Invalidates all search-related queries
 */
export const invalidateSearchCache = async (queryClient: QueryClient): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: [SEARCH_QUERY_KEY_PREFIX] });
};

/**
 * Prefetches a search query to ensure it's cached before the user needs it
 */
export const prefetchSearchQuery = async (
  queryClient: QueryClient,
  searchParam: [number, number] | string,
  fetchFn: () => Promise<any>,
  filters: Record<string, any> = {},
  radius: number = 5
): Promise<void> => {
  const queryKey = createSearchQueryKey(searchParam, filters, radius);
  
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Checks if a search query already exists in the cache
 */
export const isSearchQueryCached = (
  queryClient: QueryClient,
  searchParam: [number, number] | string,
  filters: Record<string, any> = {},
  radius: number = 5
): boolean => {
  const queryKey = createSearchQueryKey(searchParam, filters, radius);
  return queryClient.getQueryData(queryKey) !== undefined;
};
