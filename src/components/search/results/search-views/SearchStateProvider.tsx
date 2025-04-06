
import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useSearchPages } from '@/hooks/planning/use-planning-search';
import { Application } from '@/types/planning';

interface SearchState {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  loadingState: {
    isLoading: boolean;
    stage: 'initial' | 'searching' | 'processing' | 'complete' | 'error';
    error: Error | null;
    longRunning: boolean;
  };
  applications: Application[];
  filters: Record<string, any>;
  setFilters: (type: string, value: any) => void;
  retry: () => void;
  hasSearched: boolean;
  hasPartialResults: boolean;
  isSearchInProgress: boolean;
  coordinates?: [number, number] | null;
  showMap?: boolean;
  setShowMap?: Dispatch<SetStateAction<boolean>>;
  selectedId?: number | null;
  setSelectedId?: Dispatch<SetStateAction<number | null>>;
  handleMarkerClick?: (id: number) => void;
}

const SearchStateContext = createContext<SearchState | undefined>(undefined);

interface SearchStateProviderProps {
  children: ReactNode;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  initialApplications?: Application[];
  initialIsLoading?: boolean;
  coordinates?: [number, number] | null;
  showMap?: boolean;
  setShowMap?: Dispatch<SetStateAction<boolean>>;
  selectedId?: number | null;
  setSelectedId?: Dispatch<SetStateAction<number | null>>;
  handleMarkerClick?: (id: number) => void;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
}

export function SearchStateProvider({
  children,
  initialSearch,
  initialApplications = [],
  initialIsLoading = false,
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  hasPartialResults: initialHasPartialResults = false,
  isSearchInProgress: initialIsSearchInProgress = false,
}: SearchStateProviderProps) {
  // Override search parameters with initialApplications if provided
  const {
    loadingState,
    applications: fetchedApplications,
    filters,
    setFilters,
    retry,
    hasSearched,
    hasPartialResults: searchHasPartialResults,
    isSearchInProgress: searchIsSearchInProgress,
  } = useSearchPages({
    initialSearch,
    skipSearch: initialApplications && initialApplications.length > 0
  });

  // Use provided applications or fetched ones
  const applications = initialApplications && initialApplications.length > 0 
    ? initialApplications 
    : fetchedApplications;

  // Combine loading state with initialIsLoading
  const effectiveLoadingState = initialIsLoading 
    ? { ...loadingState, isLoading: true } 
    : loadingState;
    
  // Use provided states or from search hook
  const effectiveHasPartialResults = initialApplications && initialApplications.length > 0
    ? initialHasPartialResults
    : searchHasPartialResults;
    
  const effectiveIsSearchInProgress = initialApplications && initialApplications.length > 0
    ? initialIsSearchInProgress
    : searchIsSearchInProgress;

  return (
    <SearchStateContext.Provider
      value={{
        initialSearch,
        loadingState: effectiveLoadingState,
        applications,
        filters,
        setFilters,
        retry,
        hasSearched,
        hasPartialResults: effectiveHasPartialResults,
        isSearchInProgress: effectiveIsSearchInProgress,
        coordinates,
        showMap,
        setShowMap,
        selectedId,
        setSelectedId,
        handleMarkerClick
      }}
    >
      {children}
    </SearchStateContext.Provider>
  );
}

export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
}
