
import { createContext } from 'react';
import { LoadingStage } from '@/hooks/use-loading-state';
import { Application } from '@/types/planning';

export interface SearchStateContextProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  } | null;
  loadingState: {
    isLoading: boolean;
    stage: LoadingStage;
    longRunning: boolean;
    error: Error | null;
  };
  coordinates: [number, number] | null;
  postcode: string | null;
  applications: Application[];
  filters: Record<string, any>;
  setFilters: (type: string, value: any) => void;
  retry: () => void;
  hasSearched: boolean;
  hasPartialResults: boolean;
  isSearchInProgress: boolean;
}

export const SearchStateContext = createContext<SearchStateContextProps | null>(null);
