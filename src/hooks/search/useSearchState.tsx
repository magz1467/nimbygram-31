import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Application } from '@/types/planning';
import { fetchSearchResults } from '@/api/search'; // Assuming this is your API function

// Define our state types clearly
interface SearchState {
  // Search parameters
  searchTerm: string | null;
  displayTerm: string | null;
  searchType: 'postcode' | 'location';
  
  // Results
  applications: Application[];
  filteredApplications: Application[];
  coordinates: [number, number] | null;
  
  // Status flags
  isLoading: boolean;
  isSearchInProgress: boolean;
  hasSearched: boolean;
  hasPartialResults: boolean;
  longRunningSearch: boolean;
  searchDuration: number;
  
  // Error handling
  error: Error | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // Filters
  filters: Record<string, any>;
  
  // Actions
  setFilters: (filters: Record<string, any>) => void;
  retry: () => void;
  search: (term: string, type?: 'postcode' | 'location') => void;
  loadMore: () => void;
}

const SearchStateContext = createContext<SearchState | null>(null);

export const useSearchState = () => {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
};

interface SearchStateProviderProps {
  children: ReactNode;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
}

export const SearchStateProvider = ({ children, initialSearch }: SearchStateProviderProps) => {
  // Core state
  const [searchTerm, setSearchTerm] = useState<string | null>(initialSearch?.searchTerm || null);
  const [displayTerm, setDisplayTerm] = useState<string | null>(initialSearch?.displayTerm || initialSearch?.searchTerm || null);
  const [searchType, setSearchType] = useState<'postcode' | 'location'>(initialSearch?.searchType || 'location');
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  
  // Status flags
  const [isLoading, setIsLoading] = useState<boolean>(!!initialSearch?.searchTerm);
  const [isSearchInProgress, setIsSearchInProgress] = useState<boolean>(!!initialSearch?.searchTerm);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [hasPartialResults, setHasPartialResults] = useState<boolean>(false);
  const [longRunningSearch, setLongRunningSearch] = useState<boolean>(false);
  const [searchDuration, setSearchDuration] = useState<number>(0);
  
  // Error handling
  const [error, setError] = useState<Error | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Long-running search detection
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isSearchInProgress) {
      timer = setTimeout(() => {
        setLongRunningSearch(true);
      }, 5000); // 5 seconds threshold for long-running search
      
      // Start tracking search duration
      const startTime = Date.now();
      const durationInterval = setInterval(() => {
        setSearchDuration(Date.now() - startTime);
      }, 1000);
      
      return () => {
        if (timer) clearTimeout(timer);
        clearInterval(durationInterval);
      };
    } else {
      setLongRunningSearch(false);
      return undefined;
    }
  }, [isSearchInProgress]);
  
  // Filter applications when filters change
  useEffect(() => {
    if (applications.length > 0) {
      // Apply filters logic here
      // This is a simple example - adjust based on your actual filter needs
      let filtered = [...applications];
      
      // Apply each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter(app => {
            // Implement your filtering logic here
            return true; // Placeholder
          });
        }
      });
      
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications([]);
    }
  }, [applications, filters]);
  
  // Search function
  const search = useCallback(async (term: string, type: 'postcode' | 'location' = 'location') => {
    if (!term) return;
    
    setSearchTerm(term);
    setDisplayTerm(term);
    setSearchType(type);
    setIsLoading(true);
    setIsSearchInProgress(true);
    setError(null);
    setSearchDuration(0);
    setLongRunningSearch(false);
    
    try {
      const startTime = Date.now();
      
      // Fetch search results
      const result = await fetchSearchResults(term, type);
      
      setApplications(result.applications || []);
      setFilteredApplications(result.applications || []);
      setCoordinates(result.coordinates || null);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 1);
      setCurrentPage(1);
      setHasPartialResults(result.hasPartialResults || false);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setIsLoading(false);
      setIsSearchInProgress(false);
      setHasSearched(true);
    }
  }, []);
  
  // Retry function
  const retry = useCallback(() => {
    if (searchTerm) {
      search(searchTerm, searchType);
    }
  }, [search, searchTerm, searchType]);
  
  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (isLoading || currentPage >= totalPages) return;
    
    const nextPage = currentPage + 1;
    setIsLoading(true);
    
    // Implement your load more logic here
    // This is a placeholder
    setTimeout(() => {
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 1000);
  }, [currentPage, totalPages, isLoading]);
  
  // Initial search if provided
  useEffect(() => {
    if (initialSearch?.searchTerm && !hasSearched) {
      search(initialSearch.searchTerm, initialSearch.searchType);
    }
  }, [initialSearch, search, hasSearched]);
  
  const value: SearchState = {
    searchTerm,
    displayTerm,
    searchType,
    applications,
    filteredApplications,
    coordinates,
    isLoading,
    isSearchInProgress,
    hasSearched,
    hasPartialResults,
    longRunningSearch,
    searchDuration,
    error,
    currentPage,
    totalPages,
    totalCount,
    filters,
    setFilters,
    retry,
    search,
    loadMore
  };
  
  return (
    <SearchStateContext.Provider value={value}>
      {children}
    </SearchStateContext.Provider>
  );
}; 