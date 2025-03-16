
import { ReactNode } from 'react';
import { SearchStateContext } from './SearchStateContext';
import { useSearchStateProvider } from './useSearchStateProvider';

export function SearchStateProvider({ 
  children, 
  initialSearch 
}: { 
  children: ReactNode;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
}) {
  const state = useSearchStateProvider(initialSearch);
  
  return (
    <SearchStateContext.Provider value={state}>
      {children}
    </SearchStateContext.Provider>
  );
}

export { useSearchState } from './useSearchState';
